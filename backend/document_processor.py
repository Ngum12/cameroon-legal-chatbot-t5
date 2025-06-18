import re
from typing import Dict, List, Optional, Tuple

class DocumentProcessor:
    """Process legal documents to extract key information and analyze content"""
    
    def __init__(self):
        # Define patterns for various document types
        self.patterns = {
            "contract": {
                "parties": r"BETWEEN\s+(.+?)\s+AND\s+(.+?)(?:\n|,|;)",
                "effective_date": r"effective\s+(?:date|on)(?:\s+of)?\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}/\d{1,2}/\d{4}|\d{1,2}-\d{1,2}-\d{4})",
                "termination": r"(?:terminat(?:e|ion)|expire|end)(?:s|d)?\s+(?:on|at|upon)?\s+([A-Za-z]+\s+\d{1,2},\s+\d{4}|\d{1,2}\s+[A-Za-z]+,?\s+\d{4}|\d{1,2}/\d{1,2}/\d{4}|\d{1,2}-\d{1,2}-\d{4})",
                "payment": r"(?:payment|fee|compensation|amount)\s+of\s+(?:XAF|FCFA|CFA)?\s*([\d,\.]+)(?:\s*(?:XAF|FCFA|CFA))?"
            },
            "complaint": {
                "plaintiff": r"(?:plaintiff|complainant|claimant)(?:\s*:|\s+is)\s+(.+?)(?:\n|,|;)",
                "defendant": r"(?:defendant|respondent)(?:\s*:|\s+is)\s+(.+?)(?:\n|,|;)",
                "relief_sought": r"(?:relief\s+sought|requesting|demands|seeks)(?:\s*:)?\s+(.+?)(?:\.|\n)",
                "claim_amount": r"(?:claim|damages)\s+(?:in\s+the\s+amount\s+of|of)\s+(?:XAF|FCFA|CFA)?\s*([\d,\.]+)(?:\s*(?:XAF|FCFA|CFA))?"
            },
            "property": {
                "location": r"(?:located|situated)\s+at\s+(.+?)(?:\n|,|;|\.)",
                "owner": r"(?:owned|property\s+of)\s+(?:by)?\s+(.+?)(?:\n|,|;|\.)",
                "dimensions": r"(?:dimensions|area|measurement|size)\s+(?:of)?\s+(\d+(?:\.\d+)?\s*(?:hectares|sq\.?\s*m|square\s+meters|acres))",
                "title_number": r"(?:title|deed)\s+(?:number|#|no\.?|certificate)?\s+(?:is|:)?\s*([A-Za-z0-9-_/]+)" 
            }
        }
        
        # Legal references patterns
        self.legal_references = {
            "constitution": r"(?:Constitution|Constitutional)\s+(?:of\s+Cameroon)?\s*(?:Article|Art\.?)?\s+(\d+)",
            "penal_code": r"(?:Penal\s+Code|Criminal\s+Code)\s+(?:Article|Art\.?)?\s+(\d+)",
            "civil_code": r"(?:Civil\s+Code)\s+(?:Article|Art\.?)?\s+(\d+)",
            "labor_code": r"(?:Labor|Labour)\s+(?:Code)\s+(?:Article|Art\.?)?\s+(\d+)",
        }
        
        # Issues and risks to identify
        self.risk_patterns = {
            "ambiguity": [
                r"(?:undefined|vague|ambiguous|not\s+(?:clear|precise))",
                r"(?:open\s+to\s+interpretation)"
            ],
            "legality": [
                r"(?:contrary|against|violates?|non-compliant)\s+(?:to|with)\s+(?:law|regulations?|code)",
                r"(?:illegal|unlawful|not\s+legal)",
                r"(?:exceeds?|beyond)\s+(?:legal|statutory)\s+(?:limit|maximum|minimum)"
            ],
            "missing_elements": [
                r"(?:missing|lacks?|without|no)\s+(?:clause|provision|section|article)",
                r"(?:does\s+not|doesn't|fails\s+to)\s+(?:specify|state|mention|include)"
            ]
        }
    
    def detect_document_type(self, text: str) -> str:
        """Determine the type of legal document based on content analysis"""
        # Convert to lowercase and remove excess whitespace
        normalized_text = " ".join(text.lower().split())
        
        # Check for document type signatures
        if re.search(r"agreement|contract|terms|between|parties|hereby", normalized_text):
            return "contract"
        elif re.search(r"complaint|claim|plaintiff|defendant|court|lawsuit", normalized_text):
            return "complaint"
        elif re.search(r"deed|property|land|parcel|title|owned by|situated", normalized_text):
            return "property"
        else:
            return "unknown"
    
    def extract_metadata(self, text: str, doc_type: Optional[str] = None) -> Dict:
        """Extract relevant metadata from the document"""
        if not doc_type:
            doc_type = self.detect_document_type(text)
        
        metadata = {"document_type": doc_type}
        
        # Find matches based on document type
        if doc_type in self.patterns:
            for key, pattern in self.patterns[doc_type].items():
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    metadata[key] = match.group(1).strip()
        
        # Extract legal references
        legal_refs = {}
        for law, pattern in self.legal_references.items():
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                legal_refs[law] = matches
        
        if legal_refs:
            metadata["legal_references"] = legal_refs
            
        return metadata
    
    def identify_risks(self, text: str) -> List[Dict]:
        """Identify potential legal risks or issues in the document"""
        risks = []
        
        for risk_type, patterns in self.risk_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text, re.IGNORECASE)
                for match in matches:
                    # Get context (surrounding text)
                    start = max(0, match.start() - 50)
                    end = min(len(text), match.end() + 50)
                    context = text[start:end].replace('\n', ' ').strip()
                    
                    risks.append({
                        "type": risk_type,
                        "match": match.group(0),
                        "context": context,
                        "position": match.start()
                    })
        
        return sorted(risks, key=lambda r: r["position"])
    
    def analyze_document(self, text: str) -> Dict:
        """Perform comprehensive document analysis"""
        doc_type = self.detect_document_type(text)
        metadata = self.extract_metadata(text, doc_type)
        risks = self.identify_risks(text)
        
        # Generate relevant laws reference based on document type
        relevant_laws = self.get_relevant_laws(doc_type)
        
        return {
            "document_type": doc_type,
            "metadata": metadata,
            "risks_identified": risks,
            "relevant_laws": relevant_laws
        }
    
    def get_relevant_laws(self, doc_type: str) -> List[str]:
        """Return relevant laws based on document type"""
        laws_by_type = {
            "contract": [
                "Cameroon Civil Code, Articles 1101-1369",
                "OHADA Uniform Act on General Commercial Law",
                "Law No. 2016/007 of 12 July 2016 on the Penal Code (for contract breaches)"
            ],
            "complaint": [
                "Cameroon Civil Procedure Code",
                "Law No. 2006/015 of 29 December 2006 on Judicial Organization",
                "Law No. 2016/007 of 12 July 2016 on the Penal Code"
            ],
            "property": [
                "Ordinance No. 74-1 of 6 July 1974 on Land Tenure",
                "Ordinance No. 74-2 of 6 July 1974 on State Lands",
                "Decree No. 76/165 of 27 April 1976 on land registration",
                "Law No. 80-22 of 14 July 1980 on property development"
            ]
        }
        
        return laws_by_type.get(doc_type, ["Cameroon Civil Code", "Cameroon Penal Code"])