import os
import joblib
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

DATA_PATH = "training/training_data.csv"
MODEL_PATH = "models/recommendation_model.pkl"

FEATURES = [
    "skill_match",
    "distance_km",
    "rating",
    "experience_years",
    "hourly_rate",
    "is_available",
    "is_verified",
    "completed_jobs",
    "acceptance_rate",
    "completion_rate",
    "customer_previous_jobs",
]

data = pd.read_csv(DATA_PATH)

X = data[FEATURES]
y = data["label"]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

model = GradientBoostingClassifier(
    n_estimators=150,
    learning_rate=0.05,
    max_depth=3,
    random_state=42,
)

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"Accuracy: {accuracy:.4f}")
print()
print(classification_report(y_test, predictions))

os.makedirs("models", exist_ok=True)

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
    },
    MODEL_PATH,
)

print(f"Model saved to {MODEL_PATH}")