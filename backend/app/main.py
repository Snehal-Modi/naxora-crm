"""FastAPI application entrypoint for Naxora CRM."""

import logging
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import CRMException
from app.api.v1.router import api_router

# Setup basic logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger("naxora_crm")

app = FastAPI(
    title=settings.APP_NAME,
    description="Enterprise CRM for Nexora Staffing LLP (Recruitment, Staffing, Courses & Services)",
    version="1.0.0",
    docs_url=f"{settings.API_V1_PREFIX}/docs" if settings.DEBUG else None,
    redoc_url=f"{settings.API_V1_PREFIX}/redoc" if settings.DEBUG else None,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json" if settings.DEBUG else None,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(CRMException)
async def crm_exception_handler(request: Request, exc: CRMException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "detail": exc.detail,
            "error_code": exc.error_code,
            "extra": exc.extra
        },
        headers=exc.headers
    )


# Include v1 API router
app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "version": "1.0.0",
        "api_docs": f"{settings.API_V1_PREFIX}/docs" if settings.DEBUG else "disabled in production",
        "health": f"{settings.API_V1_PREFIX}/health"
    }

