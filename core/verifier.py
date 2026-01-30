import random
import time

class GeoSentinel:
    """
    AI-driven component that simulates the analysis of satellite imagery
    to verify carbon assets.
    """
    def __init__(self):
        self.green_threshold = 45.0
        self.confidence_threshold = 0.80
        self.verification_history = []  # Track all verifications

    def verify_location(self, lat, lon):
        """
        Simulates fetching a satellite image and running a deep learning model.
        Returns a verification result with detailed reasons.
        """
        reasons = []
        
        # 1. SPECIAL DEMO WHITELIST
        # If the user enters the specific demo coordinates, give a perfect result.
        if abs(lat - 11.4102) < 0.001 and abs(lon - 76.6950) < 0.001:
            green_cover = 94.5
            authenticity_score = 0.99
            reasons.append("High Density Forest Detected")
        else:
            # 2. Standard Simulation
            # Deterministic capability based on coords for demo consistency
            random.seed(lat + lon) 
            
            # Widen the range to ensure we see both bad and good results 
            # BIAS: Weighted towards "verified" (forests) to match user expectation
            green_cover = random.uniform(35, 98) # Mostly > 45%
            authenticity_score = random.uniform(0.78, 0.99) # Check score

        # 3. Decision Logic
        is_valid = True
        
        # Criterion A: Green Cover
        if green_cover < self.green_threshold:
            is_valid = False
            reasons.append(f"Insufficient Green Cover ({round(green_cover,1)}% < {self.green_threshold}%)")
        
        # Criterion B: AI Confidence/Authenticity
        if authenticity_score < self.confidence_threshold:
            is_valid = False
            reasons.append(f"AI Confidence Low - Potential Forgery ({round(authenticity_score*100,1)}% < {round(self.confidence_threshold*100,1)}%)")


        if is_valid:
            status = "VERIFIED"
            if not reasons: reasons.append("Asset Meets All Environmental Criteria")
        else:
            status = "FLAGGED"

        # 4. Carbon Credit Calculation
        # Simple formula for demo: (Green Cover % / 100) * 25 credits maximum * Confidence
        if is_valid:
            carbon_credits = (green_cover / 100) * 25.0 * authenticity_score
        else:
            carbon_credits = 0.0


        result = {
            "latitude": lat,
            "longitude": lon,
            "green_cover_percentage": round(green_cover, 2),
            "ai_confidence": round(authenticity_score * 100, 1),
            "status": status,
            "carbon_credits": round(carbon_credits, 2),
            "reasons": reasons,
            "timestamp": time.time()
        }
        
        # Store in history
        self.verification_history.append(result)
        
        return result

    
    def get_verification_history(self):
        """Returns the history of all verifications performed by this sentinel"""
        return self.verification_history

