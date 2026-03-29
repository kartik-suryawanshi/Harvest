import json
from typing import Any, Dict

def get_residue_recommendation(crop: str, condition: str, livestock: bool, goal: str, lang: str = "en", model: Any = None) -> Dict[str, Any]:
    """
    Returns a residue management recommendation using Gemini AI.
    Strictly relies on AI; no rule-based fallback.
    """
    if not model:
        raise ValueError("Gemini AI is not configured. Please check your API key.")

    try:
        prompt = f"""
        You are an expert agricultural consultant. Provide a specialized crop residue management plan.
        Input Parameters:
        - Crop: {crop}
        - Residue State: {condition}
        - Livestock on farm: {'Yes' if livestock else 'No'}
        - Farmer's Primary Goal: {goal}

        Response Requirements:
        - Provide the response STRICTLY in JSON format.
        - Language: {lang} (if 'hi' use Hindi, if 'mr' use Marathi, else English).
        - Use the following JSON schema:
        {{
            "primary_method": "Title of the recommended method",
            "alternatives": ["Alternative 1", "Alternative 2"],
            "benefit_key": "One-sentence key benefit",
            "steps_key": ["Step 1", "Step 2", "Step 3", "Step 4", "Step 5"]
        }}
        """
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        # Clean up potential markdown formatting
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        data = json.loads(text)
        
        # Validate required fields
        required = ["primary_method", "alternatives", "benefit_key", "steps_key"]
        if all(k in data for k in required):
            return data
        else:
            missing = [k for k in required if k not in data]
            raise ValueError(f"AI response missing required fields: {', '.join(missing)}")
            
    except json.JSONDecodeError:
        raise RuntimeError("AI generated an invalid response format. Please try again.")
    except Exception as e:
        raise RuntimeError(f"Gemini AI Error: {str(e)}")


