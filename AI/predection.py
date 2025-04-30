import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.metrics import mean_absolute_error, classification_report

# Step 1: Load the Dataset
data = {
    'id': [1, 10, 11, 13, 14, 16, 17],
    'date_created': ['2025-04-11', '2025-04-21', '2025-04-11', '2025-04-11', '2025-04-11', '2025-04-11', '2025-04-16'],
    'description': [
        'Website redesign project',
        'managment of club robotics',
        'rrrr',
        'sdds',
        'fghfhghg',
        'dffdfd',
        'this project is for crete robots'
    ],
    'image_url': [
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABXgA...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
        'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'
    ],
    'last_updated': ['2025-04-11', '2025-04-21', '2025-04-11', '2025-04-11', '2025-04-11', '2025-04-11', '2025-04-16'],
    'nom': ['Website Redesign', 'projet1 ee', 'rr', 'sddsddsd', 'fghgfghgh', 'tofat', 'first project'],
    'progress': [75, 38, 60, 20, 36, 24, 15],
    'status': ['IN_PROGRESS', 'IN_PROGRESS', 'Not_Started', 'IN_PROGRESS', 'Not_Started', 'IN_PROGRESS', 'Not_Started'],
    'user_id': [1, 4, 1, 4, 4, 4, 4]
}

df = pd.DataFrame(data)

# Step 2: Preprocess the Data
# Convert date columns to datetime format
df['date_created'] = pd.to_datetime(df['date_created'])
df['last_updated'] = pd.to_datetime(df['last_updated'])

# Calculate the duration of the project (in days)
df['duration_days'] = (df['last_updated'] - df['date_created']).dt.days + 1  # Add 1 to avoid zero division

# Encode the 'status' column as numerical values
status_mapping = {'Not_Started': 0, 'IN_PROGRESS': 1}
df['status_encoded'] = df['status'].map(status_mapping)

# Drop unnecessary columns (e.g., image_url, description)
df = df.drop(columns=['image_url', 'description', 'nom'])

# Step 3: Define Features and Target Variables
# For Progress Prediction (Regression)
X_reg = df[['duration_days', 'status_encoded', 'user_id']]
y_reg = df['progress']

# For Status Prediction (Classification)
X_cls = df[['duration_days', 'progress', 'user_id']]
y_cls = df['status_encoded']

# Step 4: Split Data into Training and Testing Sets
X_train_reg, X_test_reg, y_train_reg, y_test_reg = train_test_split(X_reg, y_reg, test_size=0.2, random_state=42)
X_train_cls, X_test_cls, y_train_cls, y_test_cls = train_test_split(X_cls, y_cls, test_size=0.2, random_state=42)

# Step 5: Train Regression Model for Progress Prediction
reg_model = RandomForestRegressor(random_state=42)
reg_model.fit(X_train_reg, y_train_reg)

# Evaluate Regression Model
y_pred_reg = reg_model.predict(X_test_reg)
mae = mean_absolute_error(y_test_reg, y_pred_reg)
print(f"Mean Absolute Error for Progress Prediction: {mae:.2f}%")

# Step 6: Train Classification Model for Status Prediction
cls_model = RandomForestClassifier(random_state=42)
cls_model.fit(X_train_cls, y_train_cls)

# Evaluate Classification Model
y_pred_cls = cls_model.predict(X_test_cls)
report = classification_report(y_test_cls, y_pred_cls, target_names=['Not_Started', 'IN_PROGRESS'])
print("Classification Report for Status Prediction:\n", report)

# Step 7: Make Predictions on New Data
# Example: Predict progress for a new project
new_project_reg = [[10, 1, 4]]  # duration_days=10, status_encoded=1 (IN_PROGRESS), user_id=4
predicted_progress = reg_model.predict(new_project_reg)
print(f"Predicted Progress for New Project: {predicted_progress[0]:.2f}%")

# Example: Predict status for a new project
new_project_cls = [[10, 50, 4]]  # duration_days=10, progress=50%, user_id=4
predicted_status = cls_model.predict(new_project_cls)
status_labels = ['Not_Started', 'IN_PROGRESS']
print(f"Predicted Status for New Project: {status_labels[predicted_status[0]]}")