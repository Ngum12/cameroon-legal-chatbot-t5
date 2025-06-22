import logging
import re
import traceback
import requests
from bs4 import BeautifulSoup
from urllib.parse import quote_plus
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# FastAPI app setup
app = FastAPI(title="Cameroonian Legal Assistant API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://cameroon-legal-assistant.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Model setup and loading
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL = None
TOKENIZER = None

# Update model loading section
try:
    MODEL_PATH = "distilgpt2"  # Use a small model for testing
    # Or use your own model if you've uploaded it to Hugging Face
    # MODEL_PATH = "YOUR_USERNAME/cameroon-legal-model"
    
    MODEL = AutoModelForCausalLM.from_pretrained(MODEL_PATH).to(device)
    TOKENIZER = AutoTokenizer.from_pretrained(MODEL_PATH)
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {str(e)}")
    logger.warning("Application will run with limited functionality")

# Request models
class QuestionRequest(BaseModel):
    question: str
    language: str = "en"  # Default to English

# ----- CORE UTILITY FUNCTIONS -----

def preprocess_text(text):
    """Clean and prepare text for the model"""
    # Basic cleaning
    text = text.strip()
    
    # Remove excess whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text

def safety_filter(question, answer):
    """Critical safety filter to prevent harmful content"""
    question_lower = question.lower()
    answer_lower = answer.lower()
    
    # Block dangerous responses about killing/violence
    dangerous_patterns = [
        "killing is good", "i will kill", "how to kill", "murder", 
        "commit suicide", "make a bomb", "weapon", "terror", "yes, and i will kill", 
        "yes, killing is", "killing is not bad", "harmful", "illegal activity"
    ]
    
    # Check if answer contains dangerous content
    for pattern in dangerous_patterns:
        if pattern in answer_lower:
            return True
            
    # Check if question is about violence and answer is affirmative
    violence_terms = ["kill", "killing", "murder", "hurt", "harm", "attack"]
    affirmative_starts = ["yes", "sure", "definitely", "absolutely", "of course"]
    
    if any(term in question_lower for term in violence_terms):
        if any(answer_lower.startswith(start) for start in affirmative_starts):
            return True
    
    return False

def is_greeting(text):
    """Check if the input text is a greeting"""
    greetings = ["hello", "hi", "hey", "greetings", "good morning", "good afternoon", 
                "good evening", "bonjour", "salut", "hola", "what's up"]
    
    text_lower = text.lower().strip()
    
    # Check if text contains only a greeting
    if text_lower in greetings:
        return True
        
    # Check if text starts with a greeting followed by punctuation
    for greeting in greetings:
        if text_lower.startswith(greeting + " ") or text_lower == greeting:
            return True
            
    return False

def is_out_of_domain(question):
    """Check if question is outside of Cameroonian law and governance"""
    question_lower = question.lower()
    
    # Check for geography questions
    geography_terms = ["located", "where is", "continent", "map", "border", "capital city", 
                      "geography", "population", "climate", "country location"]
    if any(term in question_lower for term in geography_terms):
        return True
    
    # Check for non-legal topics
    non_legal_topics = [
        "recipe", "cook", "food", "sport", "football", "soccer", "basketball", 
        "movie", "music", "song", "artist", "celebrity", "weather", "bitcoin",
        "cryptocurrency", "investment", "dating", "relationship", "game", "gaming",
        "technology", "computer", "phone", "android", "iphone", "travel", "vacation",
        "hotel", "flight", "tourism"
    ]
    
    for topic in non_legal_topics:
        if topic in question_lower:
            return True
    
    # Check for questions about other countries' laws (excluding Cameroon)
    countries = ["usa", "america", "american", "united states", "canada", "canadian", 
                "uk", "britain", "british", "england", "france", "french", "germany", 
                "german", "nigeria", "nigerian", "south africa", "ghana", "kenya", 
                "egypt", "morocco", "algeria", "australia", "china", "chinese", 
                "japan", "japanese", "rwanda", "russia", "india"]
    
    # Only flag as other country if explicitly asking about another country's laws
    legal_terms = ["law", "legal", "court", "right", "constitution", "legislation", "judiciary"]
    
    if "cameroon" not in question_lower:
        for country in countries:
            if country in question_lower:
                # If asking about another country's law specifically
                if any(term in question_lower for term in legal_terms):
                    return True
    
    return False

def is_low_quality_answer(question, answer):
    """Better detection of poor quality model responses"""
    answer_lower = answer.lower()
    question_lower = question.lower()
    
    # Check for common incorrect patterns in model's responses
    problematic_patterns = [
        # Generic article 1 response to unrelated questions
        "article 1 of the constitution affirms",
        # Incomplete or incorrect protest information
        "right to protest against racism",
        # Clearly wrong information
        "cameroon is the first to approve",
        # Generic yes/no with little substance
        "yes, cameroon has",
        # Incorrect references
        "national law no. 2010012", 
        "1951 peace treaty",
        # Too simplistic/uninformative
        "cameroon has compiled a list"
    ]
    
    if any(pattern in answer_lower for pattern in problematic_patterns):
        return True
        
    # The answer is way too short
    if len(answer.split()) < 20:
        return True
        
    # Generic yes/no answers with little specifics
    if answer_lower.startswith("yes,") and len(answer.split()) < 25:
        return True
        
    # Answers don't match the question topic
    if "child" in question_lower and "child" not in answer_lower and "minor" not in answer_lower:
        return True
        
    if "protest" in question_lower and "protest" not in answer_lower and "assembly" not in answer_lower:
        return True
        
    if "judicial reform" in question_lower and "reform" not in answer_lower:
        return True
        
    return False

def add_markdown_formatting(answer):
    """Add professional markdown formatting to responses"""
    # If answer doesn't start with heading, add one
    if not answer.startswith("## "):
        answer = "## Cameroon Legal Information\n\n" + answer
    
    # Remove academic disclaimer if present
    if "This is for academic purposes" in answer:
        answer = answer.replace("This is for academic purposes; please verify information with official sources.", "")
    
    answer = answer.strip()
    
    return answer

# ----- RESPONSE GENERATORS -----

def get_greeting_response(language="en"):
    """Return a professional greeting response"""
    if language == "en":
        return (
            "## Welcome to the Cameroon Legal Assistant\n\n"
            "Hello! I'm your assistant for information about Cameroonian law and governance. "
            "I can help with questions about Cameroon's:\n\n"
            "- Constitutional provisions and rights\n"
            "- Government structure and officials\n"
            "- Court system and legal procedures\n"
            "- Civil and criminal laws\n\n"
            "How can I assist you with Cameroonian legal information today?"
        ), "Greeting"
    else:
        return (
            "## Bienvenue à l'Assistant Juridique du Cameroun\n\n"
            "Bonjour! Je suis votre assistant pour des informations sur le droit et la gouvernance camerounais. "
            "Je peux vous aider avec des questions sur:\n\n"
            "- Les dispositions et droits constitutionnels\n"
            "- La structure gouvernementale et les responsables\n"
            "- Le système judiciaire et les procédures légales\n"
            "- Les lois civiles et pénales\n\n"
            "Comment puis-je vous aider avec des informations juridiques camerounaises aujourd'hui?"
        ), "Accueil"

def get_out_of_domain_response(language="en"):
    """Return a response for questions outside legal domain"""
    if language == "en":
        return (
            "## Cameroon Legal Focus\n\n"
            "I'm specifically designed to answer questions about Cameroonian legal systems, governance, and laws. "
            "Your question appears to be outside my specialized knowledge area.\n\n"
            "I'd be happy to help you with information about:\n"
            "- Cameroon's constitution and legal framework\n"
            "- Government structure and officials\n"
            "- Legal rights and procedures in Cameroon\n"
            "- Civil and criminal laws of Cameroon\n\n"
            "Please feel free to ask any Cameroon-related legal questions."
        ), "Scope Notice"
    else:
        return (
            "## Focus sur le Droit Camerounais\n\n"
            "Je suis spécifiquement conçu pour répondre aux questions sur les systèmes juridiques, la gouvernance et les lois du Cameroun. "
            "Votre question semble être en dehors de mon domaine de connaissance spécialisé.\n\n"
            "Je serais heureux de vous aider avec des informations sur:\n"
            "- La constitution et le cadre juridique du Cameroun\n"
            "- La structure gouvernementale et les fonctionnaires\n"
            "- Les droits et procédures légales au Cameroun\n"
            "- Les lois civiles et pénales du Cameroun\n\n"
            "N'hésitez pas à poser des questions juridiques relatives au Cameroun."
        ), "Avis de Portée"

def get_foreign_law_response(language="en"):
    """Return a response redirecting to Cameroon for questions about other countries"""
    if language == "en":
        return (
            "## Cameroon Legal Specialization\n\n"
            "I specialize exclusively in Cameroonian law and legal systems. I don't have information about laws or legal systems of other countries.\n\n"
            "If you'd like to know how similar legal concepts apply in Cameroon, please rephrase your question to focus on Cameroon's legal framework."
        ), "Jurisdiction Notice"
    else:
        return (
            "## Spécialisation en Droit Camerounais\n\n"
            "Je suis spécialisé exclusivement dans le droit et les systèmes juridiques camerounais. Je n'ai pas d'informations sur les lois ou systèmes juridiques d'autres pays.\n\n"
            "Si vous souhaitez savoir comment des concepts juridiques similaires s'appliquent au Cameroun, veuillez reformuler votre question pour vous concentrer sur le cadre juridique camerounais."
        ), "Avis de Juridiction"

def get_safe_override_response(language="en"):
    """Safe response that overrides dangerous content"""
    if language == "en":
        return (
            "## Cameroon Criminal Law Information\n\n"
            "The Cameroon Penal Code strictly prohibits violence against persons. "
            "Homicide, assault, and threats of violence are serious criminal offenses under Cameroonian law.\n\n"
            "Article 275 of the Penal Code classifies murder as a capital offense, while Articles 278-282 "
            "address various forms of bodily harm, all carrying significant legal penalties.\n\n"
            "The legal system is designed to protect human life and safety."
        ), "Criminal Law"
    else:
        return (
            "## Informations sur le Droit Pénal Camerounais\n\n"
            "Le Code Pénal camerounais interdit strictement la violence contre les personnes. "
            "L'homicide, les agressions et les menaces de violence sont des infractions criminelles graves selon la loi camerounaise.\n\n"
            "L'article 275 du Code Pénal classe le meurtre comme une infraction capitale, tandis que les articles 278-282 "
            "traitent des diverses formes de préjudice corporel, toutes passibles de lourdes sanctions légales.\n\n"
            "Le système juridique est conçu pour protéger la vie humaine et la sécurité."
        ), "Droit Pénal"

# ----- MODEL AND SEARCH FUNCTIONS -----

def get_answer_from_model(question, language):
    """Get answer from the model"""
    try:
        if MODEL is None or TOKENIZER is None:
            logger.warning("Model not available")
            return None, None
            
        # Preprocess the question
        processed_question = preprocess_text(question)
        input_text = "question: " + processed_question

        # Generate answer
        input_ids = TOKENIZER(input_text, return_tensors="pt", max_length=128, padding="max_length", truncation=True).input_ids.to(device)

        outputs = MODEL.generate(
            input_ids=input_ids,
            max_length=256,
            num_beams=4,
            early_stopping=True,
            no_repeat_ngram_size=2
        )

        answer = TOKENIZER.decode(outputs[0], skip_special_tokens=True)
        
        # Determine appropriate source
        source = "Cameroonian Law"
        
        # Return the answer and source
        return answer, source
        
    except Exception as e:
        logger.error(f"Error getting model answer: {str(e)}")
        traceback.print_exc()
        return None, None

def duckduckgo_search(query, max_results=5):
    """Enhanced and robust DuckDuckGo search implementation"""
    try:
        # Add Cameroon context to all searches
        search_query = f"{query} Cameroon law legal"
        encoded_query = quote_plus(search_query)
        
        url = f"https://html.duckduckgo.com/html/?q={encoded_query}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml",
            "Accept-Language": "en-US,en;q=0.9"
        }
        
        logger.info(f"Searching DuckDuckGo for: {search_query}")
        response = requests.get(url, headers=headers, timeout=10)
        
        if response.status_code != 200:
            logger.error(f"DuckDuckGo search failed with status: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.text, 'html.parser')
        
        results = []
        
        # Try multiple selector patterns to find results
        selectors = ['.result__body', '.result', '.results_links', '.web-result']
        
        for selector in selectors:
            search_results = soup.select(selector)
            if search_results:
                for result in search_results[:max_results]:
                    # Try different selectors for title and snippet
                    title_element = (
                        result.select_one('.result__title') or 
                        result.select_one('.result__a') or
                        result.select_one('h2') or
                        result.select_one('.title')
                    )
                    
                    snippet_element = (
                        result.select_one('.result__snippet') or
                        result.select_one('.snippet') or
                        result.select_one('.result__body') or
                        result.select_one('.result-snippet')
                    )
                    
                    if not title_element or not snippet_element:
                        continue
                        
                    title = title_element.get_text() if title_element else ""
                    snippet = snippet_element.get_text() if snippet_element else ""
                    
                    if len(snippet.strip()) > 20:  # Only include substantial results
                        results.append({
                            "title": title.strip(),
                            "snippet": snippet.strip()
                        })
                break
        
        logger.info(f"Found {len(results)} results from DuckDuckGo")
        return results
        
    except Exception as e:
        logger.error(f"DuckDuckGo search error: {str(e)}")
        traceback.print_exc()
        return []

def format_search_results(results, language):
    """Format search results in professional markdown"""
    if not results:
        return None
        
    if language == 'en':
        response = "## Cameroon Legal Information\n\n"
    else:
        response = "## Informations Juridiques du Cameroun\n\n"
    
    for result in results:
        response += f"### {result['title']}\n{result['snippet']}\n\n"
    
    return response

def get_hardcoded_answer(question, language):
    """Get hardcoded reliable answers for common questions"""
    question_lower = question.lower()
    
    # Dictionary of common questions with hardcoded reliable answers
    en_responses = {
        "prime minister": (
            "## Cameroon's Prime Minister\n\n"
            "In Cameroon, the Prime Minister is appointed by the President of the Republic, Paul Biya, according to Article 10 of the 1996 Constitution. This appointment is made at the President's discretion, without requiring parliamentary approval.\n\n"
            "The Prime Minister serves as the head of government and works under the authority of the President. The Prime Minister coordinates government action and implements policies determined by the President. Cabinet ministers are appointed by the President on the recommendation of the Prime Minister.\n\n"
            "The current Prime Minister of Cameroon is Dr. Joseph Dion Ngute, who was appointed on January 4, 2019. The Prime Minister's role is largely administrative, as executive power remains concentrated with the President.", 
            "Government"
        ),
        "president": (
            "## President of Cameroon\n\n"
            "Paul Biya is the President of Cameroon. He has been in power since November 6, 1982, making him one of Africa's longest-serving heads of state. As President, he serves as both Head of State and head of the executive branch.\n\n"
            "Under the Constitution, the President has extensive powers including appointing the Prime Minister and cabinet, serving as commander-in-chief of the armed forces, negotiating and ratifying treaties, and exercising regulatory powers. Constitutional amendments in 1996 and 2008 extended the presidential term from 5 to 7 years and removed term limits, allowing unlimited re-elections.\n\n"
            "The President is elected by direct universal suffrage for a 7-year term. Paul Biya was most recently re-elected in October 2018.", 
            "Government"
        ),
        "judges": (
            "## Judicial Appointments in Cameroon\n\n"
            "In Cameroon, judges are appointed by the President of the Republic upon proposal by the Higher Judicial Council (Conseil Supérieur de la Magistrature). This process is established by Article 37 of the Constitution.\n\n"
            "The Higher Judicial Council is chaired by the President himself, with the Minister of Justice serving as vice-chair. This structure gives the executive branch significant influence over judicial appointments, raising concerns about judicial independence.\n\n"
            "Cameroonian judges are divided into two categories: judges of the bench (magistrats du siège) who adjudicate cases, and judges of the prosecution (magistrats du parquet) who represent the public interest. All judges receive their training at the National School of Administration and Magistracy (ENAM).\n\n"
            "Under Law No. 2006/015 of December 29, 2006, judges are expected to be independent in their decision-making, though structural challenges to this independence have been noted by legal scholars and international organizations.", 
            "Judiciary"
        ),
        "court": (
            "## Cameroonian Court System\n\n"
            "The Cameroonian court system consists of a four-tier hierarchy:\n\n"
            "1. The **Supreme Court** (Cour Suprême): The highest court in the country, it reviews decisions from lower courts and has jurisdiction over constitutional matters, administrative disputes, and cases involving high-ranking officials.\n\n"
            "2. **Courts of Appeal** (Cours d'Appel): Located in each region, they hear appeals from High Courts and Courts of First Instance.\n\n"
            "3. **High Courts** (Tribunaux de Grande Instance): These have jurisdiction over serious civil and criminal matters.\n\n"
            "4. **Courts of First Instance** (Tribunaux de Première Instance): The entry point for most legal cases, handling minor civil and criminal matters.\n\n"
            "Additionally, Cameroon has specialized courts including Administrative Courts, Audit Courts, Military Tribunals, and customary law courts in certain regions. The judicial system follows both the English common law and French civil law traditions due to Cameroon's unique colonial history, creating a bijural legal system.", 
            "Judiciary"
        ),
        "constitution": (
            "## Cameroonian Constitution\n\n"
            "Cameroon's current constitution was adopted in 1972 and has been amended several times, most significantly in 1996 and 2008. It establishes a unitary state with a presidential system of government.\n\n"
            "Key features of the Cameroonian Constitution include:\n\n"
            "1. **Government Structure**: Establishes three branches—executive, legislative, and judicial—with significant powers granted to the executive.\n\n"
            "2. **Fundamental Rights**: Guarantees civil liberties including freedom of expression, association, and religion, though implementation has been criticized.\n\n"
            "3. **Bilingualism**: Establishes both English and French as official languages, reflecting Cameroon's colonial heritage.\n\n"
            "4. **Decentralization**: Provides for regional and local authorities with limited autonomy.\n\n"
            "5. **Presidential Powers**: Grants extensive powers to the President, including appointing the Prime Minister, cabinet members, and judges.\n\n"
            "The 1996 amendment introduced provisions for decentralized territorial communities, while the 2008 amendment notably removed presidential term limits. Constitutional reforms remain a topic of ongoing debate, particularly regarding greater regional autonomy and power distribution.", 
            "Legal System"
        ),
        "child": (
            "## Children's Rights in Cameroon\n\n"
            "Children's rights in Cameroon are protected through various legal frameworks:\n\n"
            "1. **International Commitments**: Cameroon has ratified the UN Convention on the Rights of the Child (CRC) and the African Charter on the Rights and Welfare of the Child.\n\n"
            "2. **Constitution**: Article 65 incorporates international treaties into national law, giving constitutional protection to children's rights.\n\n"
            "3. **Specific Laws**:\n"
            "   - Law No. 98/004 on Education Guidelines guarantees the right to education\n"
            "   - Law No. 2005/015 on Combating Child Trafficking and Slavery\n"
            "   - Labor Code (Law No. 92/007) prohibits child labor under age 14\n"
            "   - Penal Code protects children from abuse and exploitation\n\n"
            "4. **Legal Protections**: Children have rights to identity (birth registration), education, healthcare, protection from abuse and exploitation, and special judicial procedures.\n\n"
            "5. **Juvenile Justice**: Special courts and procedures exist for minors in conflict with the law, focusing on rehabilitation rather than punishment.\n\n"
            "Despite these legal protections, implementation challenges persist, particularly in rural areas where traditional practices sometimes conflict with formal legal frameworks.", 
            "Children's Rights"
        ),
        "protest": (
            "## Protest Rights in Cameroon\n\n"
            "In Cameroon, the right to peaceful assembly is recognized in principle under Article 21 of the Constitution, which guarantees freedom of expression. However, in practice, public demonstrations are regulated by Law No. 90/055 of December 19, 1990, which requires prior authorization from administrative authorities.\n\n"
            "Organizers must submit a declaration to local authorities at least 3 days before the planned event, specifying details such as purpose, date, time, and location. Authorities can prohibit demonstrations deemed to threaten public order.\n\n"
            "Implementation of these regulations has been criticized by human rights organizations, noting that permissions for demonstrations by opposition groups are frequently denied. The law grants significant discretion to local authorities in determining what constitutes a threat to public order.", 
            "Constitutional Rights"
        ),
        "law": (
            "## Cameroon Legal System\n\n"
            "Cameroon's legal system encompasses various key areas of legislation, including:\n\n"
            "1. **Constitution of 1972** (amended 1996, 2008): The foundational legal document establishing government structure and fundamental rights.\n\n"
            "2. **Civil Code**: Based on the French Civil Code, governing personal status, contracts, property, and obligations.\n\n"
            "3. **Penal Code**: Defining criminal offenses and penalties (Law No. 2016/007).\n\n"
            "4. **Labor Code** (Law No. 92/007): Regulating employment relationships and working conditions.\n\n" 
            "5. **Family Law**: Including marriage regulations, divorce, and child custody.\n\n"
            "6. **Commercial Code**: Governing business relations and corporate structures.\n\n"
            "7. **Land Tenure Law** (Ordinance 74-1, 74-2): Establishing land ownership systems.\n\n"
            "8. **Environmental Law** (Law No. 96/12): Framework for environmental protection.\n\n"
            "9. **Investment Code**: Regulations for domestic and foreign investments.\n\n"
            "Cameroon's legal system is mixed, reflecting both civil law (French) and common law (British) traditions due to its colonial history.", 
            "Legal System"
        ),
        "kill": (
            "## Cameroon Criminal Law on Homicide\n\n"
            "Homicide is strictly prohibited under the Cameroon Penal Code. Article 275 classifies murder as a capital offense punishable by death, although there has been a de facto moratorium on executions in recent years.\n\n"
            "The Penal Code distinguishes between different types of homicide:\n\n"
            "- **Murder**: Intentional homicide with premeditation\n"
            "- **Manslaughter**: Intentional homicide without premeditation\n"
            "- **Negligent homicide**: Death resulting from negligence\n\n"
            "Self-defense is recognized as a justification for homicide under strict conditions specified in Articles 84 and 85 of the Penal Code, including immediate necessity and proportionality of response.\n\n"
            "The Cameroonian legal system protects the right to life, and taking human life is a serious criminal offense.", 
            "Criminal Law"
        )
    }

    fr_responses = {
        "premier ministre": (
            "## Premier Ministre du Cameroun\n\n"
            "Au Cameroun, le Premier Ministre est nommé par le Président de la République, Paul Biya, conformément à l'article 10 de la Constitution de 1996. Cette nomination est faite à la discrétion du Président, sans nécessiter l'approbation parlementaire.\n\n"
            "Le Premier Ministre sert comme chef du gouvernement et travaille sous l'autorité du Président. Le Premier Ministre coordonne l'action gouvernementale et met en œuvre les politiques déterminées par le Président. Les ministres du cabinet sont nommés par le Président sur recommandation du Premier Ministre.\n\n"
            "L'actuel Premier Ministre du Cameroun est le Dr Joseph Dion Ngute, qui a été nommé le 4 janvier 2019. Le rôle du Premier Ministre est largement administratif, car le pouvoir exécutif reste concentré entre les mains du Président.", 
            "Gouvernement"
        ),
        "président": (
            "## Président du Cameroun\n\n"
            "Paul Biya est le Président du Cameroun. Il est au pouvoir depuis le 6 novembre 1982, ce qui fait de lui l'un des chefs d'État africains au pouvoir depuis le plus longtemps. En tant que Président, il sert à la fois comme Chef de l'État et chef du pouvoir exécutif.\n\n"
            "Selon la Constitution, le Président dispose de pouvoirs étendus, notamment la nomination du Premier ministre et du cabinet, le commandement en chef des forces armées, la négociation et la ratification des traités, et l'exercice des pouvoirs réglementaires. Les amendements constitutionnels de 1996 et 2008 ont prolongé le mandat présidentiel de 5 à 7 ans et supprimé les limitations de mandats, permettant des réélections illimitées.\n\n"
            "Le Président est élu au suffrage universel direct pour un mandat de 7 ans. Paul Biya a été réélu plus récemment en octobre 2018.", 
            "Gouvernement"
        )
    }
    
    responses = en_responses if language == "en" else fr_responses
    
    # Search through hardcoded responses
    for key, value in responses.items():
        if key in question_lower:
            return value
    
    # Default fallback for questions without hardcoded answers
    return None

# ----- API ENDPOINTS -----

@app.get("/")
async def read_root():
    """Root endpoint with API information"""
    return {
        "name": "Cameroonian Legal Assistant API",
        "description": "API for providing information about Cameroonian law and legal system",
        "endpoints": {
            "/ask": "POST - Ask a question about Cameroonian law",
            "/test-search": "GET - Test the search functionality directly"
        },
        "status": "Model is loaded and ready" if MODEL is not None else "Limited functionality - Model not loaded"
    }

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    question = request.question
    language = request.language
    question_lower = question.lower()
    
    logger.info(f"Question received: '{question}'")
    
    try:
        # If model is not available, handle that first
        if MODEL is None:
            # For greetings, still give nice response
            if is_greeting(question):
                greeting_response, source = get_greeting_response(language)
                return {"answer": greeting_response, "source": source}
                
            # For hardcoded questions, use those
            hardcoded = get_hardcoded_answer(question, language)
            if hardcoded:
                answer, source = hardcoded
                logger.info("Using hardcoded answer (model unavailable)")
                return {"answer": answer, "source": source}
                
            # Try search as main fallback
            logger.info("Model unavailable, trying search")
            search_results = duckduckgo_search(question)
            
            if search_results and len(search_results) > 0:
                search_answer = format_search_results(search_results, language)
                if search_answer:
                    logger.info("Using search results (model unavailable)")
                    return {"answer": search_answer, "source": "Legal Research"}
            
            # If all else fails
            if language == 'en':
                return {"answer": "## Cameroon Legal Information\n\nI'm experiencing technical difficulties connecting to the legal database. Please try a simple question about Cameroon law or try again later.", "source": "Technical Notice"}
            else:
                return {"answer": "## Informations Juridiques du Cameroun\n\nJe rencontre des difficultés techniques pour me connecter à la base de données juridiques. Veuillez poser une question simple sur le droit camerounais ou réessayer plus tard.", "source": "Avis Technique"}
        
        # STEP 1: Check for greetings
        if is_greeting(question):
            logger.info("Greeting detected")
            greeting_response, source = get_greeting_response(language)
            return {"answer": greeting_response, "source": source}
            
        # STEP 2: Check for violence-related questions
        if any(term in question_lower for term in ["kill", "killing", "murder", "suicide", "bomb", "weapon", "terror"]):
            logger.info("SAFETY ALERT: Potentially harmful question detected")
            safe_response, source = get_safe_override_response(language)
            return {"answer": safe_response, "source": source}
        
        # STEP 3: Check for out-of-domain questions
        if is_out_of_domain(question):
            logger.info("Out-of-domain question detected")
            
            # Specifically identify foreign law questions
            for country in ["usa", "america", "uk", "france", "nigeria", "rwanda"]:
                if country in question_lower and any(term in question_lower for term in ["law", "legal", "right"]):
                    foreign_response, source = get_foreign_law_response(language)
                    return {"answer": foreign_response, "source": source}
                    
            # General out-of-domain response
            out_of_domain_response, source = get_out_of_domain_response(language)
            return {"answer": out_of_domain_response, "source": source}
        
        # STEP 4: Check hardcoded answers for common questions
        hardcoded = get_hardcoded_answer(question, language)
        if hardcoded:
            answer, source = hardcoded
            logger.info("Using hardcoded answer")
            return {"answer": answer, "source": source}
        
        # STEP 5: Get model answer
        model_answer, model_source = get_answer_from_model(question, language)
        
        # Check if model answer is valid and safe
        if model_answer:
            # Check for dangerous content
            if safety_filter(question, model_answer):
                logger.warning("SAFETY ALERT: Dangerous model response filtered")
                safe_response, source = get_safe_override_response(language)
                return {"answer": safe_response, "source": source}
            
            # Check for low quality responses
            if not is_low_quality_answer(question, model_answer):
                logger.info("Using high-quality model answer")
                formatted_answer = add_markdown_formatting(model_answer)
                
                # Determine appropriate source
                if "constitution" in question_lower:
                    source = "Constitutional Law"
                elif "court" in question_lower or "judge" in question_lower or "judicial" in question_lower:
                    source = "Judiciary"
                elif "president" in question_lower or "minister" in question_lower or "government" in question_lower:
                    source = "Government"
                elif "child" in question_lower:
                    source = "Children's Rights"
                elif "criminal" in question_lower or "penal" in question_lower:
                    source = "Criminal Law"
                else:
                    source = model_source or "Cameroonian Law"
                    
                return {"answer": formatted_answer, "source": source}
            else:
                logger.info("Low quality model answer detected, trying search")
        else:
            logger.info("No model answer available, trying search")
        
        # STEP 6: Fall back to search
        search_results = duckduckgo_search(question)
        
        if search_results and len(search_results) > 0:
            search_answer = format_search_results(search_results, language)
            if search_answer:
                logger.info("Using search results")
                return {"answer": search_answer, "source": "Legal Research"}
        
        # STEP 7: If search failed but we have model answer, use it anyway as last resort
        if model_answer:
            logger.info("Search failed, using model answer despite quality concerns")
            formatted_answer = add_markdown_formatting(model_answer)
            return {"answer": formatted_answer, "source": model_source or "Cameroonian Law"}
        
        # STEP 8: Provide a fallback response if everything else failed
        logger.info("All answer sources failed, using fallback")
        
        if language == 'en':
            fallback = (
                "## Cameroon Legal Information\n\n"
                "I don't have specific information about that aspect of Cameroonian law. "
                "For the most accurate information on this topic, I would recommend consulting "
                "the Cameroonian legal code or reaching out to a qualified legal professional in Cameroon."
            )
        else:
            fallback = (
                "## Information Juridique du Cameroun\n\n"
                "Je n'ai pas d'informations spécifiques sur cet aspect du droit camerounais. "
                "Pour des informations plus précises sur ce sujet, je vous recommande de consulter "
                "le code juridique camerounais ou de contacter un professionnel du droit qualifié au Cameroun."
            )
            
        return {"answer": fallback, "source": "Information Notice"}
        
    except Exception as e:
        # Comprehensive error handling
        logger.error(f"Unhandled error: {str(e)}")
        traceback.print_exc()
        
        if language == 'en':
            error_response = "## Technical Notice\n\nI apologize for the technical difficulties. Please try asking your question about Cameroonian law in a different way."
        else:
            error_response = "## Avis Technique\n\nJe m'excuse pour les difficultés techniques. Veuillez essayer de poser votre question sur le droit camerounais d'une manière différente."
            
        return {"answer": error_response, "source": "System Notice"}

@app.get("/test-search")
async def test_search_endpoint(query: str):
    """Test endpoint for DuckDuckGo search"""
    try:
        results = duckduckgo_search(query)
        formatted = format_search_results(results, "en") if results else "No results found"
        
        return {
            "query": query,
            "success": len(results) > 0,
            "result_count": len(results),
            "formatted_answer": formatted
        }
    except Exception as e:
        return {
            "error": str(e),
            "query": query,
            "success": False
        }

# Startup event
@app.on_event("startup")
async def startup_event():
    logger.info("Cameroonian Legal Assistant API starting up")
    logger.info(f"Model loaded: {MODEL is not None}")