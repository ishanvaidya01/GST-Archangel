import os
import torch
from torch.utils.data import DataLoader, Dataset
from transformers import VisionEncoderDecoderModel, AutoProcessor
from PIL import Image
import json

class InvoiceDataset(Dataset):
    def __init__(self, image_paths, processor, max_length=512):
        self.image_paths = image_paths
        self.processor = processor
        self.max_length = max_length

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        img_path = self.image_paths[idx]
        
        import pypdfium2 as pdfium
        pdf = pdfium.PdfDocument(img_path)
        page = pdf.get_page(0)
        pil_image = page.render(scale=2).to_pil().convert("RGB")
        image = pil_image
        
        gt_path = img_path.replace('.pdf', '_gt.json')
        if os.path.exists(gt_path):
            with open(gt_path, 'r', encoding='utf-8') as f:
                gt_json = f.read()
        else:
            gt_json = '{"vendor": "Demo Company", "total": "100.00"}'
            
        pixel_values = self.processor(image, return_tensors="pt").pixel_values
        
        labels = self.processor.tokenizer(
            gt_json, 
            add_special_tokens=True, 
            max_length=self.max_length, 
            padding="max_length", 
            truncation=True, 
            return_tensors="pt"
        ).input_ids
        
        labels[labels == self.processor.tokenizer.pad_token_id] = -100
        
        return {"pixel_values": pixel_values.squeeze(), "labels": labels.squeeze()}

def train_model():
    print("--- GST ARCHANGEL: INITIALIZING DEEP DONUT TRAINING PIPELINE ---", flush=True)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using compute device: {device.upper()}")
    
    model_id = "naver-clova-ix/donut-base"
    print(f"Loading Base Model: {model_id}...")
    processor = AutoProcessor.from_pretrained(model_id)
    model = VisionEncoderDecoderModel.from_pretrained(model_id, use_safetensors=True)
    
    for param in model.encoder.parameters():
        param.requires_grad = False
    model.decoder.gradient_checkpointing_enable()
    model.config.pad_token_id = processor.tokenizer.pad_token_id
    model.config.decoder_start_token_id = processor.tokenizer.convert_tokens_to_ids(['<s>'])[0] if processor.tokenizer.convert_tokens_to_ids(['<s>'])[0] != processor.tokenizer.unk_token_id else processor.tokenizer.bos_token_id
    
    model.to(device)
    
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    pur_dir = os.path.join(base_dir, "datasets", "purchase_invoices")
    sal_dir = os.path.join(base_dir, "datasets", "sales_invoices")
    
    image_paths = []
    if os.path.exists(pur_dir):
        image_paths.extend([os.path.join(pur_dir, f) for f in os.listdir(pur_dir) if f.endswith(".pdf")])
    if os.path.exists(sal_dir):
        image_paths.extend([os.path.join(sal_dir, f) for f in os.listdir(sal_dir) if f.endswith(".pdf")])
        
    # Using full dataset for training as requested
    print(f"Loaded {len(image_paths)} invoices for deep learning.", flush=True)
    
    train_dataset = InvoiceDataset(image_paths, processor)
    train_dataloader = DataLoader(train_dataset, batch_size=1, shuffle=True)
    
    optimizer = torch.optim.AdamW(model.parameters(), lr=5e-5)
    scaler = torch.amp.GradScaler('cuda') if device == "cuda" else None
    
    print("Starting Deep Training Epochs...", flush=True)
    
    num_epochs = 3
    for epoch in range(num_epochs):
        print(f"\n--- EPOCH {epoch+1}/{num_epochs} ---", flush=True)
        model.train()
        
        for step, batch in enumerate(train_dataloader):
            pixel_values = batch["pixel_values"].to(device)
            labels = batch["labels"].to(device)
            
            if device == "cuda":
                torch.cuda.empty_cache()
                with torch.amp.autocast('cuda'):
                    outputs = model(pixel_values=pixel_values, labels=labels)
                    loss = outputs.loss
                scaler.scale(loss).backward()
                scaler.step(optimizer)
                scaler.update()
            else:
                outputs = model(pixel_values=pixel_values, labels=labels)
                loss = outputs.loss
                loss.backward()
                optimizer.step()
                
            optimizer.zero_grad()
            
            if step % 5 == 0:
                print(f"  Epoch {epoch+1} | Step {step}/{len(train_dataloader)} | Loss: {loss.item():.4f}", flush=True)
                
        save_path = f"models/donut_gst_finetuned_epoch_{epoch+1}"
        os.makedirs(save_path, exist_ok=True)
        model.save_pretrained(save_path)
        processor.save_pretrained(save_path)
        print(f"Checkpoint saved to {save_path}")
            
    print("--- FULL TRAINING COMPLETE ---")
    
    final_save_path = "models/donut_gst_finetuned_final"
    os.makedirs(final_save_path, exist_ok=True)
    model.save_pretrained(final_save_path)
    processor.save_pretrained(final_save_path)
    print(f"Final model saved to {final_save_path}")

if __name__ == "__main__":
    train_model()
