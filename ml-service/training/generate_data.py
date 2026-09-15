import numpy as np
import pandas as pd

np.random.seed(42)

N = 5000

data = pd.DataFrame({
    "skill_match": np.random.uniform(0, 1, N),
    "distance_km": np.random.uniform(0.2, 10, N),
    "rating": np.random.uniform(2.5, 5, N),
    "experience_years": np.random.uniform(0, 20, N),
    "hourly_rate": np.random.uniform(100, 1500, N),
    "is_available": np.random.randint(0, 2, N),
    "is_verified": np.random.randint(0, 2, N),
    "completed_jobs": np.random.randint(0, 500, N),
    "acceptance_rate": np.random.uniform(0.2, 1, N),
    "completion_rate": np.random.uniform(0.3, 1, N),
    "customer_previous_jobs": np.random.randint(0, 10, N),
})

# Convert raw values into useful normalized signals

distance_score = 1 - (data["distance_km"] / 10)

rating_score = data["rating"] / 5

experience_score = np.minimum(
    data["experience_years"] / 10,
    1
)

price_score = 1 - np.minimum(
    data["hourly_rate"] / 1500,
    1
)

jobs_score = np.minimum(
    data["completed_jobs"] / 100,
    1
)

# Synthetic latent preference score
score = (
    0.30 * data["skill_match"]
    + 0.15 * distance_score
    + 0.15 * rating_score
    + 0.08 * experience_score
    + 0.07 * price_score
    + 0.08 * data["is_available"]
    + 0.07 * data["is_verified"]
    + 0.05 * jobs_score
    + 0.03 * data["acceptance_rate"]
    + 0.01 * data["completion_rate"]
    + 0.01 * np.minimum(
        data["customer_previous_jobs"] / 5,
        1
    )
)

# Add small noise so the model has something realistic to learn
score += np.random.normal(0, 0.05, N)

data["label"] = (score >= 0.55).astype(int)

output = "training/training_data.csv"

data.to_csv(output, index=False)

print(f"Generated {N} training samples")
print(f"Positive samples: {data['label'].sum()}")
print(f"Saved to {output}")