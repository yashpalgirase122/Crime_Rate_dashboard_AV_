from fastapi import FastAPI
from pydantic import BaseModel
import random

app = FastAPI(title="Nexus AI ML Service")

class PredictionRequest(BaseModel):
    zone: str
    time: str

@app.get("/")
def read_root():
    return {"status": "AI Model Server Running"}

@app.post("/predict-hotspot")
def predict_hotspot(req: PredictionRequest):
    # Dummy ML logic: return a random confidence score
    confidence = round(random.uniform(70.0, 98.5), 1)
    return {
        "zone": req.zone,
        "predicted_threat_level": "High" if confidence > 90 else "Medium",
        "confidence": confidence,
        "recommended_action": "Increase patrol"
    }

@app.post("/match-face")
def match_face():
    # In reality, this would take an image upload and run OpenCV/face_recognition
    return {
        "match_found": True,
        "similarity_score": 92.4,
        "suspect_id": "CR-8942",
        "name": "Unknown (Alias: Viper)"
    }

class ChatRequest(BaseModel):
    message: str

@app.post("/api/chat")
def chat_assistant(req: ChatRequest):
    msg = req.message.lower()
    response = "I couldn't analyze that request. Could you be more specific?"
    
    if "robbery" in msg and "hotspot" in msg:
        response = "Based on our latest analytics, the major robbery hotspots are in Sector 4 and Downtown Commercial area between 22:00 and 02:00."
    elif "unsolved" in msg and "cybercrime" in msg:
        response = "There are currently 42 unsolved cybercrime cases. Most of them share a similar pattern involving phishing attacks targeting senior citizens in Zone B."
    elif "suspect" in msg or "related" in msg:
        response = "Analyzing the M.O... Cross-referencing database... I found 3 suspects with matching profiles: John Doe (Alias: Ghost), Jane Smith, and an unidentified individual seen near the subway station."
    elif "repeated offender" in msg or "repeat offender" in msg:
        response = "Scanning criminal records... Found 5 high-probability repeat offenders in your vicinity. Suggesting deployment of facial recognition in Sector 7."
    else:
        response = f"AI Analysis of '{req.message}': Request processed. Extracting entities... No direct matches found in priority database. Would you like me to run a deeper scan?"
        
    return {"reply": response}

@app.get("/api/detect-anomalies")
def detect_anomalies():
    # Simulated anomaly detection
    return {
        "anomalies": [
            {"zone": "Downtown East", "type": "Sudden Spike", "category": "Vehicle Theft", "increase": "314%", "risk_level": "CRITICAL"},
            {"zone": "Industrial Park", "type": "Pattern Match", "category": "Vandalism", "increase": "85%", "risk_level": "HIGH"},
            {"zone": "North Suburbs", "type": "Unusual Time", "category": "Burglary", "increase": "120%", "risk_level": "HIGH"}
        ],
        "summary_score": 87.4
    }

class FilterRequest(BaseModel):
    query: str

@app.post("/api/filter-crimes")
def filter_crimes(req: FilterRequest):
    return {
        "applied_filters": [req.query],
        "results_found": random.randint(12, 140),
        "risk_zone": "High Risk",
        "similar_cases": random.randint(2, 8)
    }
