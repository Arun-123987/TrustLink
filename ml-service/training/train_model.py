import os
import joblib
import pandas as pd

from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


SYNTHETIC_PATH = "training/training_data.csv"
REAL_PATH = "training/real_training_data.csv"
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


# --------------------------------
# 1. Load datasets
# --------------------------------

synthetic_data = pd.read_csv(SYNTHETIC_PATH)

print(f"Synthetic samples: {len(synthetic_data)}")


if os.path.exists(REAL_PATH):
    real_data = pd.read_csv(REAL_PATH)
    print(f"Real samples: {len(real_data)}")
else:
    real_data = pd.DataFrame(columns=synthetic_data.columns)
    print("No real training data found.")


# --------------------------------
# 2. Combine datasets
# --------------------------------

data = pd.concat(
    [synthetic_data, real_data],
    ignore_index=True
)

print(f"Total samples: {len(data)}")
print(f"Positive samples: {data['label'].sum()}")
print(f"Negative samples: {(data['label'] == 0).sum()}")


# --------------------------------
# 3. Prepare features
# --------------------------------

X = data[FEATURES]
y = data["label"]


# --------------------------------
# 4. Train/test split
# --------------------------------

indices = data.index

train_indices, test_indices = train_test_split(
    indices,
    test_size=0.2,
    random_state=42,
    stratify=y,
)


X_train = X.loc[train_indices]
X_test = X.loc[test_indices]

y_train = y.loc[train_indices]
y_test = y.loc[test_indices]


# --------------------------------
# 5. Give real data higher weight
# --------------------------------

sample_weights = pd.Series(
    1.0,
    index=data.index
)

# Real data gets 5x importance
real_start = len(synthetic_data)

if len(real_data) > 0:
    sample_weights.loc[real_start:] = 5.0


train_weights = sample_weights.loc[train_indices]


# --------------------------------
# 6. Create model
# --------------------------------

model = GradientBoostingClassifier(
    n_estimators=150,
    learning_rate=0.05,
    max_depth=3,
    random_state=42,
)


# --------------------------------
# 7. Train model
# --------------------------------

model.fit(
    X_train,
    y_train,
    sample_weight=train_weights
)


# --------------------------------
# 8. Evaluate
# --------------------------------

predictions = model.predict(X_test)

accuracy = accuracy_score(
    y_test,
    predictions
)

print()
print(f"Accuracy: {accuracy:.4f}")
print()
print(classification_report(y_test, predictions))


# --------------------------------
# 9. Save model
# --------------------------------

os.makedirs("models", exist_ok=True)

joblib.dump(
    {
        "model": model,
        "features": FEATURES,
    },
    MODEL_PATH,
)

print()
print(f"Model saved to {MODEL_PATH}")