from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
import torch
import re
import os
from datasets import Dataset, load_dataset
from gtts import gTTS
from dotenv import load_dotenv
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize model and tokenizer
model = None
tokenizer = None
device = "cuda" if torch.cuda.is_available() else "cpu"

# Function to speak text using gTTS
def speak(text):
    try:
        logger.info(f"Speaking: '{text}'")
        tts = gTTS(text=text, lang='en', slow=False)
        temp_file = "temp_speech.mp3"
        tts.save(temp_file)
        if os.name == 'nt':  # Windows
            os.system(f"start {temp_file}")
        else:  # macOS/Linux
            os.system(f"mpg321 {temp_file}")
        logger.info("Speech completed successfully")
        return True
    except Exception as e:
        logger.error(f"Speech synthesis failed: {str(e)}")
        return False

# Load dataset from JSON file
def load_dataset_from_json(file_path):
    try:
        dataset = load_dataset('json', data_files=file_path)
        return dataset['train']
    except Exception as e:
        logger.error(f"Failed to load dataset: {str(e)}")
        raise

# Tokenize dataset
def tokenize_function(examples):
    inputs = []
    outputs = []
    
    for prompt, completion in zip(examples["prompt"], examples["completion"]):
        inputs.append(f"Convert this into steps:\n{prompt}\nSteps:\n1.")
        if not completion.startswith("1."):
            steps = completion.split('\n')
            numbered_steps = "\n".join([f"{i+1}. {step.strip()}" for i, step in enumerate(steps) if step.strip()])
            outputs.append(numbered_steps)
        else:
            outputs.append(completion)
    
    model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding="max_length")
    labels = tokenizer(outputs, max_length=512, truncation=True, padding="max_length")
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Initialize a new model
def initialize_model():
    global model, tokenizer
    
    try:
        logger.info("Initializing new model")
        tokenizer = AutoTokenizer.from_pretrained("gpt2")
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
        
        model = AutoModelForCausalLM.from_config(
            AutoModelForCausalLM.from_pretrained("gpt2").config
        )
        model = model.to(device)
        logger.info("Model initialized successfully")
    except Exception as e:
        logger.error(f"Model initialization failed: {str(e)}")
        raise

# Train the model
@app.route('/train-model', methods=['POST'])
def train_model():
    global model, tokenizer
    
    try:
        # Initialize fresh model
        initialize_model()
        
        # Load and prepare dataset
        dataset = load_dataset_from_json("dataset.json")
        split_dataset = dataset.train_test_split(test_size=0.2)
        tokenized_train = split_dataset["train"].map(tokenize_function, batched=True)
        tokenized_eval = split_dataset["test"].map(tokenize_function, batched=True)

        # Training configuration
        training_args = TrainingArguments(
            output_dir="./fine-tuned-model",
            num_train_epochs=10,
            per_device_train_batch_size=2,
            per_device_eval_batch_size=2,
            save_steps=100,
            save_total_limit=2,
            logging_dir="./logs",
            logging_steps=10,
            evaluation_strategy="steps",
            eval_steps=50,
            learning_rate=5e-5,
            weight_decay=0.01,
            warmup_steps=50,
            save_strategy="steps",
            load_best_model_at_end=True,
            metric_for_best_model="loss",
            greater_is_better=False,
            fp16=torch.cuda.is_available()
        )

        # Initialize trainer
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_train,
            eval_dataset=tokenized_eval,
            tokenizer=tokenizer
        )

        # Train and save
        trainer.train()
        
        # Save model and tokenizer
        model.save_pretrained("./fine-tuned-model", safe_serialization=True)
        tokenizer.save_pretrained("./fine-tuned-model")
        
        # Verify model can be loaded
        load_fine_tuned_model()
        
        speak("Model training completed successfully.")
        return jsonify({
            "message": "Model training completed successfully",
            "model_files": os.listdir("./fine-tuned-model")
        }), 200
        
    except Exception as e:
        logger.error(f"Training failed: {str(e)}")
        speak(f"Model training failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Load fine-tuned model with verification
def load_fine_tuned_model():
    global model, tokenizer
    
    try:
        if not os.path.exists("./fine-tuned-model"):
            logger.error("Model directory not found")
            return False
            
        logger.info(f"Model files found: {os.listdir('./fine-tuned-model')}")
        
        tokenizer = AutoTokenizer.from_pretrained("./fine-tuned-model")
        model = AutoModelForCausalLM.from_pretrained("./fine-tuned-model")
        
        if tokenizer.pad_token is None:
            tokenizer.pad_token = tokenizer.eos_token
            
        model = model.to(device)
        
        # Verify model can perform inference
        test_input = tokenizer("Test input", return_tensors="pt").to(device)
        with torch.no_grad():
            model(**test_input)
            
        logger.info("Model loaded and verified successfully")
        return True
        
    except Exception as e:
        logger.error(f"Model loading failed: {str(e)}")
        return False

# Generate task steps with better error handling
def generate_task_steps(prompt):
    global model, tokenizer
    
    try:
        prompt = prompt.strip()
        if not prompt:
            return []

        # More explicit prompt template
        input_text = f"""Below is a project description. Convert it into clear numbered steps.

Project Description:
{prompt}

Step-by-Step Instructions:
1."""
        
        inputs = tokenizer(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True,
            padding="max_length"
        ).to(device)
        
        # More generous generation parameters
        outputs = model.generate(
            input_ids=inputs.input_ids,
            attention_mask=inputs.attention_mask,
            max_new_tokens=300,  # Increased from 200
            do_sample=True,
            top_k=30,  # Reduced from 50
            top_p=0.9,  # Reduced from 0.95
            temperature=0.8,  # Increased from 0.7
            num_return_sequences=1,
            pad_token_id=tokenizer.eos_token_id
        )
        
        full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        logger.info(f"Raw model output: {full_text}")  # Debugging

        # More flexible step extraction:
        steps = []
        for line in full_text.split('\n'):
            line = line.strip()
            # Match: "1. Step", "1) Step", or "- Step"
            if re.match(r'^(\d+[\.\)]|\-)\s+(.+)', line):
                steps.append(line)
            elif line and not steps:  # First non-empty line
                steps.append(f"1. {line}")  # Fallback numbering
        
        return steps[:10] if steps else ["No steps could be extracted"]
    
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        return [f"Error: {str(e)}"]
    


@app.route('/generate-tasks', methods=['POST'])
def handle_request():
    try:
        if model is None or tokenizer is None:
            if not load_fine_tuned_model():
                return jsonify({"error": "Model is not loaded and could not be loaded."}), 500

        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({"error": "Missing required field 'description'"}), 400
        
        steps = generate_task_steps(data['description'])
        
        if not steps:
            return jsonify({
                "error": "Could not generate tasks",
                "possible_reasons": [
                    "Model not trained - call /train-model first",
                    "Input too vague - try a more specific description",
                    "Model failed to load - check server logs"
                ]
            }), 400
        
        return jsonify({
            "generated_tasks": steps,
            "count": len(steps),
            "message": "Tasks successfully generated"
        })
    
    except Exception as e:
        logger.error(f"Endpoint error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Model status endpoint
@app.route('/model-status', methods=['GET'])
def model_status():
    try:
        model_exists = os.path.exists("./fine-tuned-model")
        loaded = model is not None and tokenizer is not None
        
        # Test model if loaded
        working = False
        if loaded:
            try:
                test_input = tokenizer("Test", return_tensors="pt").to(device)
                with torch.no_grad():
                    model(**test_input)
                working = True
            except:
                pass
        
        return jsonify({
            "model_exists": model_exists,
            "model_loaded": loaded,
            "model_working": working,
            "model_files": os.listdir("./fine-tuned-model") if model_exists else []
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    # Create necessary directories
    os.makedirs("./fine-tuned-model", exist_ok=True)
    os.makedirs("./logs", exist_ok=True)
    
    # Try to load existing model
    try:
        if os.path.exists("./fine-tuned-model"):
            load_fine_tuned_model()
    except Exception as e:
        logger.error(f"Startup model loading failed: {str(e)}")
    
    app.run(host='0.0.0.0', port=5200, debug=True)