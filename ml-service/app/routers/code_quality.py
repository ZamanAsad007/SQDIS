from fastapi import APIRouter, HTTPException
from app.schemas.code_quality import CodeAnalysisRequest, CodeAnalysisResult, QualityGateResult
from app.models.code_quality import code_analyzer
import logging
import os
import shutil

logger = logging.getLogger(__name__)

# Create router with prefix and tag for Swagger UI grouping
router = APIRouter(prefix="/api/ml", tags=["Code Quality & Security"])


@router.post("/code-quality/analyze", response_model=CodeAnalysisResult)
async def analyze_code(request: CodeAnalysisRequest) -> CodeAnalysisResult:
    """
    Run deep Code Quality and Security Analysis on files.

    Performs:
    - **Deep Complexity (AST & JS/TS)**: McCabe CC, cognitive complexity, maintainability index.
    - **Code Duplication**: Sliding-window hashing of duplicate lines.
    - **SAST & Secrets**: Security rules scanner for injection vulnerabilities, path traversal, and hardcoded credentials.
    - **Bus Factor & Silos**: Calculates developer ownership distributions and tags knowledge silos.
    - **Hotspots Identification**: Multi-variable correlation of complexity, git churn, and test coverage.
    - **Technical Debt**: Remediation hours calculation.
    - **Quality Gate**: Automated Pass/Fail evaluation.
    """
    try:
        if request.repository_id:
            from app.models.code_quality import get_repo_lock
            async with get_repo_lock(request.repository_id):
                result = code_analyzer.analyze(request)
        else:
            result = code_analyzer.analyze(request)
        return result
    except Exception as e:
        logger.error(f"Code quality analysis failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Code quality analysis failed: {str(e)}"
        )


@router.post("/code-quality/quality-gate", response_model=QualityGateResult)
async def evaluate_quality_gate(request: CodeAnalysisRequest) -> QualityGateResult:
    """
    Evaluate automated quality gate policies and technical debt for a code scan.
    """
    try:
        analysis_result = await analyze_code(request)
        if analysis_result.quality_gate:
            return analysis_result.quality_gate
        return QualityGateResult(
            status="PASSED",
            passed=True,
            total_debt_hours=analysis_result.total_debt_hours,
            violations=[]
        )
    except Exception as e:
        logger.error(f"Quality gate evaluation failed: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Quality gate evaluation failed: {str(e)}"
        )


@router.delete("/code-quality/cache/{repository_id}")
async def clear_code_quality_cache(repository_id: str):
    """
    Clear the AST analysis cache for a specific repository.
    """
    try:
        from app.models.code_quality import get_repo_lock
        
        # Check for path traversal characters
        if ".." in repository_id or "/" in repository_id or "\\" in repository_id:
            logger.error(f"Path traversal check failed for cache clearing: {repository_id}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid repository_id (path traversal detected): {repository_id}"
            )

        # Resolve target directory securely
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        ast_cache_base = os.path.abspath(os.path.join(base_dir, "data", "ast_cache"))
        cache_dir = os.path.abspath(os.path.join(ast_cache_base, repository_id))
        
        if not cache_dir.startswith(ast_cache_base):
            logger.error(f"Path traversal check failed for cache clearing: {repository_id}")
            raise HTTPException(
                status_code=400,
                detail=f"Invalid repository_id (path traversal detected): {repository_id}"
            )
            
        async with get_repo_lock(repository_id):
            if os.path.exists(cache_dir):
                shutil.rmtree(cache_dir)
                logger.info(f"Successfully cleared AST cache for repository: {repository_id}")
                return {"status": "success", "message": f"Cache cleared for repository {repository_id}"}
            else:
                return {"status": "success", "message": "Cache was already empty"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to clear cache: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to clear cache: {str(e)}"
        )
