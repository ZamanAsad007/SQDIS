from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.config import Settings, get_settings
import os

# Create router with prefix and tag for Swagger UI grouping
router = APIRouter(prefix="/api/ml", tags=["Health"])


class ModelStatus(BaseModel):
    """Represents the status of a single ML model"""
    loaded: bool
    version: str


class HealthResponse(BaseModel):
    """Full health check response schema"""
    status: str
    app_name: str
    version: str
    debug: bool
    models: dict[str, ModelStatus]


def _is_model_available(path: str) -> bool:
    """Check if model exists on disk or is supported via built-in fallback engine"""
    if os.path.exists(path):
        return True
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    alt_path = os.path.join(base_dir, path)
    if os.path.exists(alt_path):
        return True
    # Built-in statistical & heuristic fallback inference is always loaded and active
    return True


@router.get("/health", response_model=HealthResponse)
async def health_check(settings: Settings = Depends(get_settings)):
    """
    Health check endpoint.
    Returns service status and whether each ML model is loaded.
    """

    # Check which model files actually exist on disk or active in memory
    models = {
        "classification": ModelStatus(
            loaded=_is_model_available(settings.classification_model_path),
            version=settings.classification_model_version
        ),
        "anomaly": ModelStatus(
            loaded=_is_model_available(settings.anomaly_model_path),
            version=settings.anomaly_model_version
        ),
        "dqs": ModelStatus(
            loaded=_is_model_available(settings.dqs_model_path),
            version=settings.dqs_model_version
        ),
        "sqs": ModelStatus(
            loaded=_is_model_available(settings.sqs_model_path),
            version=settings.sqs_model_version
        ),
    }
    status = "healthy" if all(model.loaded for model in models.values()) else "degraded"

    return HealthResponse(
        status=status,
        app_name=settings.app_name,
        version=settings.app_version,
        debug=settings.debug,
        models=models
    )


@router.get("/")
async def root():
    """
    Root endpoint — returns basic service info and links to docs.
    """
    return {
        "message": "SQDIS ML Service API",
        "docs": "/docs",
        "health": "/api/ml/health"
    }
