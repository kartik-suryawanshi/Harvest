from typing import Any, Dict

def get_residue_recommendation(crop: str, condition: str, livestock: bool, goal: str) -> Dict[str, Any]:
    """
    Returns a residue management recommendation based on a dictionary-based rule engine.
    """
    crop = str(crop).lower()
    condition = str(condition).lower()
    if isinstance(livestock, str):
        livestock = livestock.lower() in ("true", "yes")
    
    # Rule dictionary: (condition, livestock) -> recommendation
    rules = {
        "rice": {
            ("dry", True): {"primary_method": "urea_treatment", "benefit_key": "high_protein", "steps_key": "urea_treatment_steps", "alternatives": ["fodder_blocks", "silage"]},
            ("wet", None): {"primary_method": "silage", "benefit_key": "preservation", "steps_key": "silage_steps", "alternatives": ["chopping"]}
        },
        "cotton": {
            (None, True): {"primary_method": "cottonseed_cake", "benefit_key": "high_protein", "steps_key": "cottonseed_cake_steps", "alternatives": ["chopping"]},
            (None, False): {"primary_method": "chopping", "benefit_key": "soil_organic", "steps_key": "chopping_steps", "alternatives": []}
        },
        "soybean": {
            (None, True): {"primary_method": "soybean_meal", "benefit_key": "high_protein", "steps_key": "soybean_meal_steps", "alternatives": []}
        },
        "soyabean": {
            (None, True): {"primary_method": "soybean_meal", "benefit_key": "high_protein", "steps_key": "soybean_meal_steps", "alternatives": []}
        },
        "jowar": {
            ("green", None): {"primary_method": "direct_feed", "benefit_key": "preservation", "steps_key": "direct_feed_steps", "alternatives": ["silage"]},
            ("dry", None): {"primary_method": "urea_treatment", "benefit_key": "high_protein", "steps_key": "urea_treatment_steps", "alternatives": []}
        },
        "sugarcane": {
            ("dry", None): {"primary_method": "molasses_urea", "benefit_key": "high_protein", "steps_key": "molasses_urea_steps", "alternatives": []},
            ("wet", None): {"primary_method": "silage", "benefit_key": "preservation", "steps_key": "silage_steps", "alternatives": []}
        },
        "maize": {
            ("green", None): {"primary_method": "silage", "benefit_key": "preservation", "steps_key": "silage_steps", "alternatives": []},
            ("dry", None): {"primary_method": "urea_treatment", "benefit_key": "high_protein", "steps_key": "urea_treatment_steps", "alternatives": []}
        },
        "wheat": {
            (None, True): {"primary_method": "fodder_blocks", "benefit_key": "preservation", "steps_key": "fodder_blocks_steps", "alternatives": ["urea_treatment"]},
            ("dry", False): {"primary_method": "urea_treatment", "benefit_key": "high_protein", "steps_key": "urea_treatment_steps", "alternatives": []}
        }
    }

    # Defaults
    recommendation = {
        "primary_method": "chopping",
        "alternatives": ["fungal"],
        "benefit_key": "soil_organic",
        "steps_key": "chopping_steps"
    }

    # Find matching crop
    matched_crop = None
    for c in rules.keys():
        if c in crop:
            matched_crop = c
            break

    if matched_crop:
        crop_rules = rules[matched_crop]
        # 1. Exact match
        if (condition, livestock) in crop_rules:
            recommendation.update(crop_rules[(condition, livestock)])
        # 2. Match with wildcard condition (None)
        elif (None, livestock) in crop_rules:
            recommendation.update(crop_rules[(None, livestock)])
        # 3. Match with wildcard livestock (None)
        elif (condition, None) in crop_rules:
            recommendation.update(crop_rules[(condition, None)])
        # 4. Wildcard both
        elif (None, None) in crop_rules:
            recommendation.update(crop_rules[(None, None)])

    return recommendation
