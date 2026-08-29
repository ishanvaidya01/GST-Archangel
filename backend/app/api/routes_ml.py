import structlog
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.ml_inference import HybridDocumentExtractor

router = APIRouter(prefix="/api/v1/ml", tags=["Machine Learning"])
logger = structlog.get_logger()

@router.post("/extract-invoice")
async def extract_invoice(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(('.pdf', '.png', '.jpg', '.jpeg')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF, PNG, or JPEG files are supported for extraction"
        )
        
    try:
        # Read the file bytes directly into memory
        contents = await file.read()
        
        # Initialize the AI service (singleton)
        ai_service = HybridDocumentExtractor.get_instance()
        
        # Run inference using local ML Donut model
        extracted_data = ai_service.process_file(contents, file.filename)
        
        logger.info("ml_extraction_success", filename=file.filename, data=extracted_data)
        
        return {
            "status": "success",
            "filename": file.filename,
            "extracted_data": extracted_data
        }
    except Exception as e:
        logger.error("ml_extraction_failed", error=str(e), filename=file.filename)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process document through ML pipeline: {str(e)}"
        )
