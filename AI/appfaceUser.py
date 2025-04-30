from flask import Flask, request, jsonify
import os
import uuid
import numpy as np
import face_recognition
from werkzeug.utils import secure_filename
import json
import base64
from io import BytesIO
from PIL import Image
import re
import requests

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
KNOWN_FACES_FOLDER = 'known_faces'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}
CLUBSYNC_API_BASE = 'http://localhost:8080'  # Update with your Spring Boot port

# Create directories if they don't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(KNOWN_FACES_FOLDER, exist_ok=True)

# Helper functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_base64_image(base64_string):
    """Load an image from a base64 string"""
    # Remove header if present
    if ',' in base64_string:
        base64_string = base64_string.split(',', 1)[1]
    
    image_data = base64.b64decode(base64_string)
    image = Image.open(BytesIO(image_data))
    return np.array(image)

def fetch_all_users():
    """Fetch all users with photos from Spring Boot API"""
    try:
        response = requests.get(f"{CLUBSYNC_API_BASE}/auth/users")
        if response.status_code == 200:
            return response.json()
        else:
            print(f"Failed to fetch users: {response.status_code}")
            return []
    except Exception as e:
        print(f"Error fetching users: {e}")
        return []

def fetch_user_photo(user_id):
    """Fetch a user's photo from Spring Boot API (now URL-based)"""
    try:
        response = requests.get(f"{CLUBSYNC_API_BASE}/auth/users/{user_id}")
        if response.status_code == 200:
            user_data = response.json()
            photo_url = user_data.get('photoProfil')
            
            if not photo_url:
                return None
                
            # Download the image from the URL
            img_response = requests.get(photo_url)
            if img_response.status_code == 200:
                # Convert image bytes to base64 for processing
                img_base64 = base64.b64encode(img_response.content).decode('utf-8')
                return img_base64
        return None
    except Exception as e:
        print(f"Error fetching user photo: {e}")
        return None
# API endpoint to synchronize known faces from the Spring Boot API
@app.route('/sync-faces', methods=['GET'])
def sync_faces():
    """Synchronize known faces from Spring Boot API (URL-based)"""
    try:
        users = fetch_all_users()
        synced_count = 0
        
        for user in users:
            user_id = user['id_user']
            email = user['email']
            
            # Fetch user's photo URL and download the image
            photo_base64 = fetch_user_photo(user_id)
            if not photo_base64:
                continue
                
            # Save to known_faces folder
            filepath = os.path.join(KNOWN_FACES_FOLDER, f"{email}.jpg")
            
            try:
                img_data = base64.b64decode(photo_base64)
                with open(filepath, 'wb') as f:
                    f.write(img_data)
                synced_count += 1
            except Exception as e:
                print(f"Error saving user photo: {e}")
                continue
                
        return jsonify({
            'success': True,
            'message': f'Successfully synced {synced_count} faces'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500
# Load all known faces from the directory
def scan_known_people():
    """Scan all known faces and return their names and encodings"""
    known_emails = []
    known_face_encodings = []

    for filename in os.listdir(KNOWN_FACES_FOLDER):
        if not any(filename.lower().endswith(ext) for ext in ALLOWED_EXTENSIONS):
            continue
            
        filepath = os.path.join(KNOWN_FACES_FOLDER, filename)
        # Get email (filename without extension)
        email = os.path.splitext(filename)[0]
        
        try:
            img = face_recognition.load_image_file(filepath)
            encodings = face_recognition.face_encodings(img)
            
            if len(encodings) > 1:
                print(f"WARNING: More than one face found in {filepath}. Only considering the first face.")
                
            if len(encodings) == 0:
                print(f"WARNING: No faces found in {filepath}. Ignoring file.")
            else:
                known_emails.append(email)
                known_face_encodings.append(encodings[0])
        except Exception as e:
            print(f"Error processing {filepath}: {e}")
    
    return known_emails, known_face_encodings

# Update the recognize endpoint to accept and verify email
@app.route('/recognize', methods=['POST'])
def recognize():
    """Recognize a face in the uploaded image and verify against specific email"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
        
    # Check if email is provided
    if 'email' not in request.form:
        return jsonify({'error': 'Email is required for face verification'}), 400
        
    file = request.files['image']
    email = request.form['email']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file format. Allowed formats: jpg, jpeg, png'}), 400
    
    # Get tolerance parameter (optional)
    tolerance = float(request.args.get('tolerance', 0.5))
    
    try:
        # First check if this user has a registered face
        user_face_path = os.path.join(KNOWN_FACES_FOLDER, f"{email}.jpg")
        
        if not os.path.exists(user_face_path):
            return jsonify({
                'success': False,
                'error': 'No registered face found for this email'
            }), 404
            
        # Save uploaded file temporarily
        filename = secure_filename(file.filename)
        temp_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4()}_{filename}")
        file.save(temp_path)
        
        # Process the image
        unknown_image = face_recognition.load_image_file(temp_path)
        # Scale down image if it's giant so things run a little faster
        if max(unknown_image.shape) > 1600:
            pil_img = Image.fromarray(unknown_image)
            pil_img.thumbnail((1600, 1600), Image.LANCZOS)
            unknown_image = np.array(pil_img)
            
        unknown_face_locations = face_recognition.face_locations(unknown_image)
        
        if not unknown_face_locations:
            os.remove(temp_path)
            return jsonify({'error': 'No face detected in the image'}), 400
            
        unknown_face_encodings = face_recognition.face_encodings(unknown_image, unknown_face_locations)
        
        # Load only the specified user's face
        known_image = face_recognition.load_image_file(user_face_path)
        known_face_encodings = face_recognition.face_encodings(known_image)
        
        if not known_face_encodings:
            os.remove(temp_path)
            return jsonify({'error': 'Invalid registered face - no face encodings found'}), 400
            
        known_face_encoding = known_face_encodings[0]
        
        # Find best match among faces in the uploaded image
        best_match = False
        best_confidence = 0
        
        for face_encoding in unknown_face_encodings:
            # Compare with the user's registered face
            distance = face_recognition.face_distance([known_face_encoding], face_encoding)[0]
            
            if distance <= tolerance:
                confidence = 1 - distance
                if confidence > best_confidence:
                    best_confidence = confidence
                    best_match = True
        
        # Clean up
        os.remove(temp_path)
        
        if best_match:
            return jsonify({
                'success': True,
                'email': email,
                'confidence': float(best_confidence)
            })
        else:
            return jsonify({
                'success': False,
                'error': 'Face does not match the registered face for this email'
            }), 401
            
    except Exception as e:
        print(f"Error in face recognition: {e}")
        # Clean up on error
        try:
            if os.path.exists(temp_path):
                os.remove(temp_path)
        except:
            pass
        return jsonify({'error': str(e)}), 500

# Add a new endpoint to check if a user has registered their face
@app.route('/check-enrollment', methods=['POST'])
def check_enrollment():
    """Check if a user has enrolled their face"""
    # Get email from request
    request_data = request.get_json()
    
    if not request_data or 'email' not in request_data:
        return jsonify({'error': 'Email is required'}), 400
        
    email = request_data['email']
    
    # Check if this user has a registered face
    user_face_path = os.path.join(KNOWN_FACES_FOLDER, f"{email}.jpg")
    enrolled = os.path.exists(user_face_path)
    
    if enrolled:
        # Verify the file actually contains a valid face
        try:
            img = face_recognition.load_image_file(user_face_path)
            face_encodings = face_recognition.face_encodings(img)
            valid = len(face_encodings) > 0
        except:
            valid = False
            
        return jsonify({
            'enrolled': valid,
            'message': 'Face is enrolled' if valid else 'Face is registered but invalid'
        })
    else:
        return jsonify({
            'enrolled': False,
            'message': 'No face enrolled for this email'
        })
@app.route('/register', methods=['POST'])
def register():
    """Register a new face (URL-based)"""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
        
    if 'email' not in request.form:
        return jsonify({'error': 'Email is required'}), 400
        
    file = request.files['image']
    email = request.form['email']
    
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'Invalid file format. Allowed formats: jpg, jpeg, png'}), 400
    
    try:
        # Save uploaded file
        filename = f"{email}.jpg"
        filepath = os.path.join(KNOWN_FACES_FOLDER, filename)
        file.save(filepath)
        
        # Verify we can detect a face in this image
        img = face_recognition.load_image_file(filepath)
        face_locations = face_recognition.face_locations(img)
        
        if len(face_locations) == 0:
            os.remove(filepath)
            return jsonify({'error': 'No face detected in the uploaded image'}), 400
            
        if len(face_locations) > 1:
            return jsonify({
                'warning': 'Multiple faces detected',
                'success': True,
                'email': email
            })
        
        return jsonify({
            'success': True,
            'email': email,
            'image_url': f"/known_faces/{filename}"  # Return the stored path
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/test', methods=['GET'])
def test():
    """Simple test endpoint to verify API is working"""
    return jsonify({
        'status': 'ok',
        'message': 'Face recognition API is running'
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)