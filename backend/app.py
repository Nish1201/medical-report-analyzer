"""FastAPI application for HealthLens — Member 3 (AI/Data/Backend).

Provides the official FastAPI interface for HealthLens when FastAPI is installed.
Compatible with standard ASGI servers (e.g., Uvicorn).
"""

from typing import Dict, Any

try:
    from fastapi import FastAPI, HTTPException, status
    from fastapi.middleware.cors import CORSMiddleware
    from .models import (
        AnalysisRequest,
        AnalysisResponse,
        PYDANTIC_AVAILABLE,
        validate_analysis_request_payload
    )
    from .service import analyze_lab_report

    app = FastAPI(
        title="HealthLens API",
        version="0.1.0",
        description="HealthLens Clinical Report Analysis Backend Service — Member 3",
        docs_url="/docs",
        redoc_url="/redoc"
    )

    # Enable CORS for Member 1 Frontend integration
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.get("/api/v1/health", tags=["System"])
    def get_health() -> Dict[str, Any]:
        """Health check endpoint confirming service status and operational mode."""
        return {
            "status": "healthy",
            "service": "HealthLens Backend",
            "framework": "FastAPI",
            "version": "0.1.0",
            "mode": "rule_based_baseline"
        }

    @app.post("/api/v1/analyze", response_model=AnalysisResponse, tags=["Analysis"])
    def post_analyze(request: AnalysisRequest) -> Dict[str, Any]:
        """Analyzes structured lab report data and returns standardized biomarker evaluation."""
        try:
            validated_data = validate_analysis_request_payload(request.dict())
            return analyze_lab_report(validated_data)
        except ValueError as ve:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=str(ve)
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Internal analysis processing error: {str(e)}"
            )

    FASTAPI_AVAILABLE = True

except ImportError:
    FASTAPI_AVAILABLE = False
    app = None
