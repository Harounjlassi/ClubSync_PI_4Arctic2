import json
from flask import Flask, request, jsonify
import cv2
import numpy as np
from simple_facerec import SimpleFacerec
import threading
import os
from threading import Lock
import pyttsx3
from flask_cors import CORS
import multiprocessing
from gtts import gTTS
import os


# Initialize text-to-speech engine
engine = pyttsx3.init()
engine.setProperty('rate', 150)  # Speaking speed

def speak(text):
    """Function to speak the given text"""
    try:
        engine.say(text)
        engine.runAndWait()
    except Exception as e:
        print(f"Error in speech synthesis: {e}")

detection_lock = Lock()
latest_detections = []

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Initialize face recognition
print("Initializing face recognition system...")
sfr = SimpleFacerec()

# Load encodings
print("Loading face encodings...")
try:
    sfr.load_encoding_images("images/")
except Exception as e:
    print(f"Error: {e}")
    exit()

# Shared variables for camera thread
camera_running = False
camera_thread = None

def camera_loop():
    global camera_running, latest_detections
    
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Failed to open camera")
        return
    
    cv2.namedWindow("Face Recognition", cv2.WINDOW_NORMAL)
    
    while camera_running:
        ret, frame = cap.read()
        if not ret:
            break
            
        # Process frame
        face_locations, face_info = sfr.detect_known_faces(frame)
        
        # Update shared variable with lock
        with detection_lock:
            latest_detections = [{
                'name': info['name'],
                'user_id': info['user_id'],
                'location': loc
            } for loc, info in zip(face_locations, face_info)]
        
        # Display results
        for (y1, x2, y2, x1), info in zip(face_locations, face_info):
            cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            display_text = f"{info['name']} ({info['user_id']})" if info['user_id'] else info['name']
            cv2.putText(frame, display_text, (x1, y1-10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        
        cv2.imshow("Face Recognition", frame)
        
        if cv2.waitKey(1) == 27:  # ESC key
            break
    
    cap.release()
    cv2.destroyAllWindows()

def generate_announcement(detections):
    """Generate announcement text based on detections"""
    if not detections:
        return "No faces detected"
    
    names = []
    for face in detections:
        if face['name'] != 'Unknown':
            names.append(face['name'])
        else:
            names.append("an unknown person")
    
    if len(names) == 1:
        return f"The User {names[0]} has been detected."
    else:
        return f"The User {', '.join(names[:-1])} and {names[-1]} has been detected"

@app.route('/users', methods=['GET', 'POST', 'DELETE'])
def manage_users():
    if request.method == 'GET':
        with open('users.json') as f:
            return jsonify(json.load(f))
    
    elif request.method == 'POST':
        new_user = request.json
        
        # Validate required fields
        if not all(key in new_user for key in ['user_id', 'name', 'image']):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check if image exists
        if not os.path.exists(os.path.join("images", new_user['image'])):
            return jsonify({"error": "Image file does not exist"}), 400
            
        with open('users.json', 'r+') as f:
            try:
                data = json.load(f)
                # Check for duplicate user_id
                if any(user['user_id'] == new_user['user_id'] for user in data['users']):
                    return jsonify({"error": "User ID already exists"}), 400
                    
                data['users'].append(new_user)
                f.seek(0)
                json.dump(data, f, indent=4)
                f.truncate()
                
                # Reload encodings
                sfr.load_encoding_images("images/")
                return jsonify({"status": "User added", "user": new_user})
                
            except json.JSONDecodeError:
                return jsonify({"error": "Invalid JSON data"}), 500
                
    elif request.method == 'DELETE':
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "user_id parameter required"}), 400
            
        with open('users.json', 'r+') as f:
            data = json.load(f)
            original_count = len(data['users'])
            data['users'] = [user for user in data['users'] if user['user_id'] != user_id]
            
            if len(data['users']) == original_count:
                return jsonify({"error": "User not found"}), 404
                
            f.seek(0)
            json.dump(data, f, indent=4)
            f.truncate()
            
            # Reload encodings
            sfr.load_encoding_images("images/")
            return jsonify({"status": "User deleted", "user_id": user_id})

@app.route('/start', methods=['POST'])
def start_camera():
    #threading.Thread(target=speak, args=( "Project Management Camerad Started for the face detection face",)).start()
    speak("Project Management Camerad Started for the face detection")

    global camera_running, camera_thread
    
    if not camera_running:
        camera_running = True
        camera_thread = threading.Thread(target=camera_loop)
        camera_thread.start()

        return jsonify({"status": "Camera started"})
    else:
        return jsonify({"status": "Camera already running"})

@app.route('/detect', methods=['GET'])
def get_detections():
    with detection_lock:
        current_detections = latest_detections.copy()
    
    # Announce detections in a separate thread
    announcement = generate_announcement(current_detections)
    if announcement:
        #threading.Thread(target=speak, args=(announcement,)).start()
        speak(announcement)

    return jsonify({
        "faces": current_detections,
        "face_count": len(current_detections),
        "announcement": announcement
    })




def speak(text):
    """Function to speak using gTTS"""
    try:
        print(f"[DEBUG] Speaking: {text}")
        tts = gTTS(text=text, lang='en')
        tts.save("output.mp3")
        os.system("start output.mp3")  
        print("[DEBUG] Finished speaking")
    except Exception as e:
        print(f"[ERROR] Speech synthesis failed: {e}")

@app.route('/stop', methods=['POST'])
def stop_camera():
    speak("Camera stopped")

    global camera_running
    
    camera_running = False
    if camera_thread:
        camera_thread.join()
    return jsonify({"status": "Camera stopped"})

if __name__ == '__main__':
    # Ensure required directories exist
    os.makedirs("images", exist_ok=True)
    if not os.path.exists("users.json"):
        with open("users.json", "w") as f:
            json.dump({"users": []}, f)
    
    app.run(host='0.0.0.0', port=5000, debug=True)