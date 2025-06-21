// In your API service file (e.g., src/services/api.js)
// Update the API URL to point to your Hugging Face backend
const API_URL = import.meta.env.VITE_API_URL || window.env?.REACT_APP_API_URL || 'https://huggingface.co/spaces/Ngum/cameroon-legal-assistant-api';

export const askLegalQuestion = async (question, language = 'en') => {
    try {
        const response = await fetch(`${API_URL}/ask`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question, language })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error querying legal assistant:', error);
        return { 
            answer: 'Sorry, I encountered a technical issue. Please try again later.',
            source: 'Error'
        };
    }
};