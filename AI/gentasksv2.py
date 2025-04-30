from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
import torch
import re
from datetime import datetime, timedelta
import os
from datasets import Dataset, load_dataset  # Hugging Face's datasets library
from gtts import gTTS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Pre-trained model and tokenizer
model_name = "gpt2-medium"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

# Set padding token if not already set
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token

device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

# Function to speak text using gTTS
def speak(text):
    try:
        print(f"[INFO] Speaking: '{text}'")
        tts = gTTS(text=text, lang='en', slow=False)
        temp_file = "temp_speech.mp3"
        tts.save(temp_file)
        if os.name == 'nt':  # Windows
            os.system(f"start {temp_file}")
        else:  # macOS/Linux
            os.system(f"mpg321 {temp_file}")
        print("[INFO] Speech completed successfully")
        return True
    except Exception as e:
        print(f"[ERROR] Speech synthesis failed: {str(e)}")
        return False

# Load dataset from JSON file
def load_dataset_from_json(file_path):
    """
    Loads dataset from a JSON file.
    Args:
        file_path (str): Path to the JSON file.
    Returns:
        Dataset: Hugging Face Dataset object.
    """
    try:
        # Load dataset using Hugging Face datasets library
        dataset = load_dataset('json', data_files=file_path)
        return dataset['train']  # Return the training split
    except Exception as e:
        print(f"[ERROR] Failed to load dataset: {str(e)}")
        raise

# Tokenize dataset
def tokenize_function(examples):
    inputs = [p + "\nSteps:\n1." for p in examples["prompt"]]  # Add formatting
    outputs = examples["completion"]
    model_inputs = tokenizer(inputs, max_length=512, truncation=True, padding="max_length")
    labels = tokenizer(outputs, max_length=512, truncation=True, padding="max_length")
    model_inputs["labels"] = labels["input_ids"]
    return model_inputs

# Train the model
@app.route('/train-model', methods=['POST'])
def train_model():
    try:
        # Step 1: Load dataset from JSON file
        dataset = load_dataset_from_json("dataset.json")
        
        # Split dataset into train and eval (80-20 split)
        split_dataset = dataset.train_test_split(test_size=0.2)
        train_dataset = split_dataset["train"]
        eval_dataset = split_dataset["test"]
        
        # Tokenize both datasets
        tokenized_train = train_dataset.map(tokenize_function, batched=True)
        tokenized_eval = eval_dataset.map(tokenize_function, batched=True)

        # Step 2: Define training arguments (keep evaluation_strategy="steps")
        training_args = TrainingArguments(
            output_dir="./fine-tuned-model",
            num_train_epochs=3,
            per_device_train_batch_size=4,
            save_steps=10_000,
            save_total_limit=2,
            logging_dir="./logs",
            logging_steps=500,
            evaluation_strategy="steps",  # Keep this
            eval_steps=500,
            learning_rate=5e-5,
            weight_decay=0.01,
            warmup_steps=500,
            save_strategy="steps",
            load_best_model_at_end=True,
            metric_for_best_model="loss",
            greater_is_better=False
        )

        # Step 3: Initialize Trainer with both datasets
        trainer = Trainer(
            model=model,
            args=training_args,
            train_dataset=tokenized_train,
            eval_dataset=tokenized_eval,  # Add evaluation dataset
            tokenizer=tokenizer
        )

        # Rest of your training code...

        # Step 4: Train the model
        trainer.train()

        # Step 5: Save the fine-tuned model
        model.save_pretrained("./fine-tuned-model")
        tokenizer.save_pretrained("./fine-tuned-model")

        speak("Model training completed successfully.")
        return jsonify({"message": "Model training completed successfully."}), 200
    except Exception as e:
        speak(f"Model training failed: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Generate task steps (inference)
def generate_task_steps(prompt):
    prompt = prompt.strip()
    if not prompt:
        return []

    input_text = f"""Convert this project description into clear numbered steps:

    Project: {prompt}

    Steps:
    1."""
    
    inputs = tokenizer(
        input_text,
        return_tensors="pt",
        padding=True,
        truncation=True,
        max_length=512
    ).to(device)
    
    outputs = model.generate(
        input_ids=inputs.input_ids,
        attention_mask=inputs.attention_mask,
        max_new_tokens=200,
        do_sample=True,
        top_k=50,
        top_p=0.95,
        temperature=0.7,
        no_repeat_ngram_size=2,
        pad_token_id=tokenizer.eos_token_id
    )
    
    full_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
    steps_match = re.search(r"Steps:\s*(.*)", full_text, re.DOTALL)
    
    if not steps_match:
        return []
    
    steps_text = steps_match.group(1)
    steps = []
    
    for line in steps_text.split('\n'):
        line = line.strip()
        if line and line[0].isdigit():
            step = re.sub(r"^\d+\.\s*", "", line)
            if step:
                steps.append(step)
    
    return steps[:10]

# Generate tasks endpoint
@app.route('/generate-tasks', methods=['POST'])
def handle_request():
    try:
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({"error": "Missing required fields"}), 400
        
        project_desc = data['description']
        
        steps = generate_task_steps(project_desc)
        
        if not steps:
            return jsonify({"error": "Could not generate tasks"}), 400
        
        return jsonify({
            "generated_tasks": steps,
            "count": len(steps),
            "message": "Tasks successfully generated"
        })
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5200)