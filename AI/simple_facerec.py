import cv2
import os
import face_recognition
import numpy as np
import mysql.connector

class SimpleFacerec:
    def __init__(self):
        self.known_face_encodings = []
        self.known_face_info = []
        self.db_connection = mysql.connector.connect(
            host="localhost",
            user="root",
            password="",
            database="club-int3"
        )

    def load_encoding_images(self, images_path):
        """Load face encodings from images and map to database users"""
        cursor = self.db_connection.cursor(dictionary=True)
        valid_images = 0

        try:
            cursor.execute("SELECT id_user, lastname FROM user")
            users = cursor.fetchall()
            
            user_map = {user['lastname'].lower(): user for user in users}
            
            for img_file in os.listdir(images_path):
                if not img_file.lower().endswith(('.png', '.jpg', '.jpeg')):
                    continue
                
                base_name = os.path.splitext(img_file)[0]  # "haroun.3"
                lastname_from_file = base_name.split('.')[0].lower()  # "haroun"                
                user = user_map.get(lastname_from_file)
                if not user:
                    print(f"Warning: No database user found for image {img_file}")
                    continue
                
                img_path = os.path.join(images_path, img_file)
                img = cv2.imread(img_path)
                if img is None:
                    print(f"Warning: Could not read image {img_file}")
                    continue
                
                rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
                face_encodings = face_recognition.face_encodings(rgb_img)
                
                if len(face_encodings) == 0:
                    print(f"Warning: No face found in {img_file}")
                    continue
                
                self.known_face_info.append({
                    'user_id': user['id_user'],
                    'name': user['lastname'],
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

    def detect_known_faces(self, frame):
        """Detect faces and return info with user IDs"""
        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
        
        face_locations = face_recognition.face_locations(rgb_small_frame)
        face_encodings = face_recognition.face_encodings(rgb_small_frame, face_locations)
        
        face_info = []
        for i, face_encoding in enumerate(face_encodings):
            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
            name = "Unknown"
            user_id = None
            
            if True in matches:
                face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                best_match_index = np.argmin(face_distances)
                
                if matches[best_match_index]:
                    matched_info = self.known_face_info[best_match_index]
                    name = matched_info['name']
                    user_id = matched_info['user_id']
                
            face_info.append({
                'name': name,
                'user_id': user_id,
                'location': face_locations[i]
            })
        
        face_locations = np.array(face_locations) * 4
        return face_locations.tolist(), face_info

    def __del__(self):
        if hasattr(self, 'db_connection') and self.db_connection.is_connected():
            self.db_connection.close()