import os
import sys

def check_model_path():
    model_path = "./legal_chatbot_model"
    abs_path = os.path.abspath(model_path)
    
    print(f"Looking for model at: {abs_path}")
    
    if not os.path.exists(model_path):
        print(f"❌ ERROR: Model path does not exist: {model_path}")
        return False
        
    required_files = [
        "pytorch_model.bin", 
        "config.json", 
        "tokenizer_config.json"
    ]
    
    missing_files = []
    for file in required_files:
        if not os.path.exists(os.path.join(model_path, file)):
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ ERROR: Missing required files: {', '.join(missing_files)}")
        return False
        
    print("✅ Model path exists with required files")
    return True

if __name__ == "__main__":
    check_model_path()