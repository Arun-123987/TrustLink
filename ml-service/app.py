from fastapi import FastAPI, HTTPException

from services.recommender import predict_score

app = FastAPI(
    title="TrustLink ML Service",
    version="1.0.0",
)


@app.get("/")
def health():
    return {
        "success": True,
        "service": "TrustLink ML",
        "status": "running",
    }


@app.post("/ml/predict")
def predict(data: dict):
    try:
        score = predict_score(data)

        return {
            "success": True,
            "score": score,
        }

    except Exception as error:
        raise HTTPException(
            status_code=400,
            detail=str(error),
        )