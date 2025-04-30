import os
import re
import numpy as np
import face_recognition.api as face_recognition
from PIL import Image

def image_files_in_folder(folder):
    return [os.path.join(folder, f) for f in os.listdir(folder) if re.match(r'.*\.(jpg|jpeg|png)', f, flags=re.I)]

def scan_known_people(known_people_folder):
    known_names = []
    known_face_encodings = []

    for file in image_files_in_folder(known_people_folder):
        basename = os.path.splitext(os.path.basename(file))[0]
        img = face_recognition.load_image_file(file)
        encodings = face_recognition.face_encodings(img)

        if len(encodings) > 0:
            known_names.append(basename)
            known_face_encodings.append(encodings[0])

    return known_names, known_face_encodings

def recognize_faces(image_path, known_names, known_face_encodings, tolerance=0.6):
    image = face_recognition.load_image_file(image_path)

    if max(image.shape) > 1600:
        pil_img = Image.fromarray(image)
        pil_img.thumbnail((1600, 1600), Image.LANCZOS)
        image = np.array(pil_img)

    unknown_encodings = face_recognition.face_encodings(image)
    results = []

    for unknown_encoding in unknown_encodings:
        distances = face_recognition.face_distance(known_face_encodings, unknown_encoding)
        matches = list(distances <= tolerance)

        if True in matches:
            result = [(name, float(distance)) for match, name, distance in zip(matches, known_names, distances) if match]
            results.extend(result)
        else:
            results.append(("unknown_person", None))

    if not unknown_encodings:
        results.append(("no_persons_found", None))

    return results
