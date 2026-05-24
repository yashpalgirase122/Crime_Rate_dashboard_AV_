@echo off
echo Starting AI Crime Dashboard Services...

:: Start ML Service
echo Starting ML Service on port 8000...
start cmd /k "cd ml-service && pip install -r requirements.txt && python -m uvicorn main:app --reload --port 8000"

:: Start Backend
echo Starting Node Backend on port 5000...
start cmd /k "cd backend && npm install && npm run dev"

:: Start Frontend
echo Starting Vite Frontend...
start cmd /k "cd frontend && npm install && npm run dev"

echo All services are starting up in separate windows!
