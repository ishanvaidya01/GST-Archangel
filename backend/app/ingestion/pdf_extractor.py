import io
import json
import structlog
from typing import List, Tuple
from app.ingestion.schema import ExtractedInvoice
from decimal import Decimal
from app.services.ml_inference import HybridDocumentExtractor

logger = structlog.get_logger()

def parse_single_pdf(content: bytes, filename: str) -> ExtractedInvoice:
    extractor = HybridDocumentExtractor.get_instance()
    
    result = extractor.process_file(content, filename)
    data_str = result.get("data", "{}")
    
    data_dict = json.loads(data_str)
    
    cgst = Decimal(str(data_dict.get('cgst', '0')).replace(',', ''))
    sgst = Decimal(str(data_dict.get('sgst', '0')).replace(',', ''))
    igst = Decimal(str(data_dict.get('igst', '0')).replace(',', ''))
    total = Decimal(str(data_dict.get('total', '0')).replace(',', ''))
    
    return ExtractedInvoice(
        type=data_dict.get('type', 'purchase'),
        invoice_no=data_dict.get('invoice_no', f"UNKNOWN-{filename}"),
        gstin=data_dict.get('gstin'),
        hsn_code=data_dict.get('hsn_code'),
        cgst=cgst,
        sgst=sgst,
        igst=igst,
        total=total,
        supplier_name=data_dict.get('supplier_name', 'Unknown Supplier'),
        raw_ref=filename
    )


def parse_invoice_pdfs(file_contents: List[Tuple[str, bytes]]) -> Tuple[List[ExtractedInvoice], List[str]]:
    invoices = []
    errors = []
    
    for filename, content in file_contents:
        try:
            invoices.append(parse_single_pdf(content, filename))
        except Exception as e:
            logger.error("pdf_extraction_failed", filename=filename, error=str(e))
            errors.append(f"Failed parsing {filename}: {str(e)}")
            
    return invoices, errors
