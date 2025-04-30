from flask import Flask, request, jsonify
import threading
import cv2
import os
import face_recognition
from flask_cors import CORS
import numpy as np
import mysql.connector
from datetime import datetime
from gtts import gTTS
import os

import pyttsx3


app = Flask(__name__)
CORS(app)  

engine = pyttsx3.init()
engine.setProperty('rate', 150)  

def speak(text):
    """Function to speak text using gTTS (Google Text-to-Speech)
    
    Args:
        text (str): The text to be spoken
        
    Returns:
        bool: True if successful, False if failed
    """
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


class PriorityFaceDetector:
    def __init__(self, db_config, images_path):
        self.db_config = db_config
        self.images_path = images_path
        self.known_face_encodings = []
        self.known_face_info = []
        self.priority_colors = {
            'HIGH': (0, 0, 255),    # Red
            'MEDIUM': (0, 165, 255), # Orange
            'LOW': (0, 255, 0),      # Green
            'DEFAULT': (255, 255, 255) # White
        }
        self.lock = threading.Lock()
        self.running = False  
        self.cap = None       
        
        self.db_connection = mysql.connector.connect(**self.db_config)
        self.load_encoding_images()
        self.update_task_priorities()

    def load_encoding_images(self):
        """Load face encodings from images and map to database users"""
        cursor = self.db_connection.cursor(dictionary=True)
        valid_images = 0

        try:
            cursor.execute("SELECT id_user, lastname FROM user")
            users = cursor.fetchall()
            
            user_map = {user['lastname'].lower(): user for user in users}
            
            for img_file in os.listdir(self.images_path):
                if not img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    continue
                
                base_name = os.path.splitext(img_file)[0]
                lastname_from_file = base_name.split('.')[0].lower()
                
                user = user_map.get(lastname_from_file)
                if not user:
                    print(f"Warning: No database user found for image {img_file}")
                    continue
                
                img_path = os.path.join(self.images_path, img_file)
                img = cv2.imread(img_path)
                if img is None:
                    print(f"Warning: Could not read image {img_file}")
                    continue
                
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                face_encodings = face_recognition.face_encodings(rgb_img)
                
                if len(face_encodings) == 0:
                    print(f"Warning: No face found in {img_file}")
                    continue
                
                with self.lock:
                    self.known_face_info.append({
                        'user_id': user['id_user'],
                        'lastname': user['lastname'],
                        'encoding': face_encodings[0]
                    })
                    self.known_face_encodings.append(face_encodings[0])
                    valid_images += 1
                    print(f"Mapped {img_file} to user {user['lastname']} (ID: {user['id_user']})")

            if valid_images == 0:
                raise ValueError("No valid face images could be mapped to users")
                
            print(f"Successfully loaded {valid_images} face encodings")

        except mysql.connector.Error as err:
            print(f"Database error: {err}")
            raise
        finally:
            cursor.close()

    def update_task_priorities(self):
        """Fetch latest task priorities from database"""
        cursor = self.db_connection.cursor(dictionary=True)
        try:
            cursor.execute("""
                SELECT u.id_user as user_id, t.priorite 
                FROM user u
                LEFT JOIN projet_tache t ON u.id_user = t.assignee_id
            """)
            
            self.task_priorities = {}
            for row in cursor.fetchall():
                user_id = row['user_id']
                priority = row['priorite'].upper() if row['priorite'] else 'DEFAULT'
                self.task_priorities[user_id] = priority
                
            print("Updated task priorities from database")
        except Exception as e:
            print(f"Database error: {e}")
        finally:
            cursor.close()

    def detect_faces(self, frame):
        """Detect faces and return with priority information"""
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        face_info = []
        for face_encoding in face_encodings:
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Unknown"
            user_id = None
            priority = 'DEFAULT'
            
            if True in matches:
                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                
                if matches[best_match_index]:
                    matched_info = self.known_face_info[best_match_index]
                    name = matched_info['lastname']
                    user_id = matched_info['user_id']
                    priority = self.task_priorities.get(user_id, 'DEFAULT')
            
            face_info.append({
                'name': name,
                'user_id': user_id,
                'priority': priority
            })
        
        face_locations = [(top*4, right*4, bottom*4, left*4) for (top, right, bottom, left) in face_locations]
        
        return face_locations, face_info

    def process_frame(self, frame):
        """Process each frame and draw priority-colored rectangles"""
        if cv2.getTickCount() % 30 == 0:
            self.update_task_priorities()
        
        face_locations, face_info = self.detect_faces(frame)
        
        for (top, right, bottom, left), info in zip(face_locations, face_info):
            color = self.priority_colors.get(info['priority'], self.priority_colors['DEFAULT'])
            
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            
            cv2.rectangle(frame, (left, bottom - 35), (right, bottom), color, cv2.FILLED)
            
            font = cv2.FONT_HERSHEY_DUPLEX
            cv2.putText(frame, f"{info['name']} : {info['priority']} priority tasks)", 
                    (left + 6, bottom - 6), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1)
            pr= info['priority']
            nm= info['name']
            speak("Hello "+nm+"you have "+ pr+" priority tasks")
        
        return frame

    def run(self):
        """Main loop for real-time processing"""
        self.running = True
        self.cap = cv2.VideoCapture(0)
        
        while self.running:
            ret, frame = self.cap.read()
            if not ret:
                break
                
            frame = self.process_frame(frame)
            
            cv2.imshow('Priority Face Detection', frame)
            
            if cv2.waitKey(1) & 0xFF == ord('q') or not self.running:
                break
                
        self.cleanup()

    def stop(self):
        """Stop the detection loop"""
        self.running = False
        threading.Thread(target=self._wait_and_cleanup).start()

    def _wait_and_cleanup(self):
        """Helper method to wait briefly and ensure cleanup"""
        import time
        time.sleep(0.5)  
        self.cleanup()

    def cleanup(self):
        """Release resources"""
        if self.cap and self.cap.isOpened():
            self.cap.release()
        cv2.destroyAllWindows()
        self.running = False

    def __del__(self):
        self.cleanup()
        if hasattr(self, 'db_connection') and self.db_connection.is_connected():
            self.db_connection.close()

db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'club-int3'
}

detector = PriorityFaceDetector(db_config, images_path="images/")

def run_detector():
    detector.run()

@app.route('/start-detection', methods=['POST'])
def start_detection():
    if not detector.running:
        thread = threading.Thread(target=run_detector)
        thread.daemon = True
        thread.start()
        return jsonify({'message': 'Face detection started'}), 200
    else:
        return jsonify({'message': 'Detection is already running'}), 200

@app.route('/stop-detection', methods=['POST'])
def stop_detection():
    if detector.running:
        detector.stop()
        return jsonify({'message': 'Face detection stopping...'}), 200
    else:
        return jsonify({'message': 'No detection running to stop'}), 200

@app.route('/status', methods=['GET'])
def status():
    return jsonify({
        'running': detector.running,
        'message': 'Detection is running' if detector.running else 'Detection is not running'
    }), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5100, debug=True)   