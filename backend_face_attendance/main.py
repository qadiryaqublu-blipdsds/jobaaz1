from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from database import engine, Base
import models
from routers import enrollment, attendance, admin

# Create tables if not existing
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    description="Turniket və barmaq izi sistemlərini əvəz edən Süni İntellekt əsaslı Üz Tanıma və Davamiyyət Uçotu API",
    version="2.0.0"
)

# CORS Middleware (enables PWA from any mobile browser)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(enrollment.router)
app.include_router(attendance.router)
app.include_router(admin.router)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "similarity_threshold": settings.SIMILARITY_THRESHOLD_VERIFIED
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)
