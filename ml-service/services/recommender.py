import joblib
import pandas as pd

MODEL_PATH = "models/recommendation_model.pkl"

bundle = joblib.load(MODEL_PATH)

model = bundle["model"]
FEATURES = bundle["features"]


def predict_score(worker_features):
    row = pd.DataFrame(
        [worker_features],
        columns=FEATURES,
    )

    probability = model.predict_proba(row)[0][1]

    return round(float(probability), 4)