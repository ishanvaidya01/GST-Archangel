import os
import io
import structlog
import pypdfium2 as pdfium
from PIL import Image

logger = structlog.get_logger()

class HybridDocumentExtractor:
    _instance = None
    
    def __init__(self):
        self.device = "cuda" if "torch" in globals() and globals()["torch"].cuda.is_available() else "cpu"
        self.processor = None
        self.model = None
        self.ml_loaded = False
        
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _load_ml_model(self):
        import torch
        from transformers import VisionEncoderDecoderModel, AutoProcessor

        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        finetuned_path = os.path.join(base_dir, "models", "donut_gst_finetuned_final")
        epoch_path = os.path.join(base_dir, "models", "donut_gst_finetuned_epoch_1")
        dry_run_path = os.path.join(base_dir, "models", "donut_gst_finetuned")
        
        model_id = "naver-clova-ix/donut-base" # Fallback
        if os.path.exists(finetuned_path):
            model_id = finetuned_path
        elif os.path.exists(epoch_path):
            model_id = epoch_path
        elif os.path.exists(dry_run_path):
            model_id = dry_run_path
            
        logger.info("loading_ml_model", path=model_id, device=self.device)
        
        self.processor = AutoProcessor.from_pretrained(model_id)
        self.model = VisionEncoderDecoderModel.from_pretrained(model_id, use_safetensors=True)
        self.model.to(self.device)
        self.model.eval()
        self.ml_loaded = True

    def _extract_via_ml(self, pil_image: Image.Image) -> str:
        import torch
        if not self.ml_loaded:
            self._load_ml_model()
            
        pixel_values = self.processor(pil_image, return_tensors="pt").pixel_values.to(self.device)
        
        task_prompt = "<s>"
        decoder_input_ids = self.processor.tokenizer(task_prompt, add_special_tokens=False, return_tensors="pt").input_ids.to(self.device)
        
        with torch.no_grad():
            outputs = self.model.generate(
                pixel_values,
                decoder_input_ids=decoder_input_ids,
                max_length=self.model.decoder.config.max_position_embeddings,
                pad_token_id=self.processor.tokenizer.pad_token_id,
                eos_token_id=self.processor.tokenizer.eos_token_id,
                use_cache=True,
                bad_words_ids=[[self.processor.tokenizer.unk_token_id]],
                return_dict_in_generate=True,
            )
            
        sequence = self.processor.batch_decode(outputs.sequences)[0]
        sequence = sequence.replace(self.processor.tokenizer.eos_token, "").replace(self.processor.tokenizer.pad_token, "")
        
        return sequence

    def process_file(self, file_bytes: bytes, filename: str) -> dict:
        if filename.lower().endswith(".pdf"):
            pdf = pdfium.PdfDocument(file_bytes)
            page = pdf.get_page(0)
            image = page.render(scale=2).to_pil().convert("RGB")
        else:
            image = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            
        logger.info("initiating_ml_extraction", filename=filename)
        result = self._extract_via_ml(image)
        return {"source": "pytorch_donut", "data": result}
