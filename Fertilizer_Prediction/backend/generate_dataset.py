from __future__ import annotations

import numpy as np
import pandas as pd
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent / "data"
DATA_FILE = DATA_DIR / "fertilizer_dataset.csv"

FEATURE_COLUMNS = [
    "Nitrogen",
    "Phosphorus",
    "Potassium",
    "pH",
    "Moisture",
    "Crop_Type",
    "Rainfall",
    "Temperature",
]
TARGET_COLUMN = "Fertilizer"

CROP_TYPES = ["Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Soybean", "Potato", "Barley"]
FERTILIZER_CLASSES = [
    "Urea",
    "DAP",
    "MOP",
    "NPK_Complex",
    "Compost",
    "Organic",
    "Ammonium_Sulfate",
    "Calcium_Nitrate",
]

PROFILE_BY_CLASS = {
    "Urea": {"Nitrogen": (120, 180), "Phosphorus": (30, 52), "Potassium": (20, 50), "pH": (5.8, 7.0), "Moisture": (35, 65), "Rainfall": (600, 1100), "Temperature": (22, 33)},
    "DAP": {"Nitrogen": (90, 140), "Phosphorus": (55, 90), "Potassium": (15, 35), "pH": (6.0, 7.2), "Moisture": (40, 70), "Rainfall": (650, 1200), "Temperature": (20, 32)},
    "MOP": {"Nitrogen": (40, 90), "Phosphorus": (22, 45), "Potassium": (85, 150), "pH": (5.6, 7.1), "Moisture": (30, 60), "Rainfall": (500, 1000), "Temperature": (18, 30)},
    "NPK_Complex": {"Nitrogen": (110, 165), "Phosphorus": (50, 85), "Potassium": (70, 120), "pH": (6.2, 7.3), "Moisture": (38, 68), "Rainfall": (700, 1300), "Temperature": (21, 32)},
    "Compost": {"Nitrogen": (70, 120), "Phosphorus": (35, 60), "Potassium": (45, 85), "pH": (6.1, 7.4), "Moisture": (45, 75), "Rainfall": (550, 1100), "Temperature": (20, 31)},
    "Organic": {"Nitrogen": (60, 110), "Phosphorus": (25, 55), "Potassium": (40, 80), "pH": (6.0, 7.5), "Moisture": (50, 78), "Rainfall": (600, 1150), "Temperature": (18, 29)},
    "Ammonium_Sulfate": {"Nitrogen": (100, 150), "Phosphorus": (24, 42), "Potassium": (18, 35), "pH": (5.5, 6.8), "Moisture": (32, 62), "Rainfall": (500, 980), "Temperature": (19, 31)},
    "Calcium_Nitrate": {"Nitrogen": (90, 140), "Phosphorus": (20, 38), "Potassium": (28, 55), "pH": (6.3, 7.5), "Moisture": (35, 68), "Rainfall": (550, 1050), "Temperature": (18, 30)},
}


def generate_dataset(rows: int = 600) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    data: list[dict[str, object]] = []

    for _ in range(rows):
        crop = rng.choice(CROP_TYPES)
        fertilizer = rng.choice(FERTILIZER_CLASSES)
        profile = PROFILE_BY_CLASS[fertilizer]

        crop_adjustment = {
            "Rice": {"Nitrogen": 12, "Phosphorus": 4, "Potassium": 6, "Moisture": 10, "Rainfall": 180, "Temperature": 2},
            "Wheat": {"Nitrogen": 10, "Phosphorus": 3, "Potassium": 8, "Moisture": 5, "Rainfall": 120, "Temperature": 1},
            "Maize": {"Nitrogen": 14, "Phosphorus": 5, "Potassium": 10, "Moisture": 8, "Rainfall": 150, "Temperature": 2},
            "Cotton": {"Nitrogen": 8, "Phosphorus": 6, "Potassium": 11, "Moisture": 6, "Rainfall": 100, "Temperature": 3},
            "Sugarcane": {"Nitrogen": 15, "Phosphorus": 6, "Potassium": 12, "Moisture": 12, "Rainfall": 260, "Temperature": 4},
            "Soybean": {"Nitrogen": 11, "Phosphorus": 7, "Potassium": 9, "Moisture": 7, "Rainfall": 110, "Temperature": 1},
            "Potato": {"Nitrogen": 13, "Phosphorus": 5, "Potassium": 11, "Moisture": 9, "Rainfall": 180, "Temperature": 2},
            "Barley": {"Nitrogen": 9, "Phosphorus": 4, "Potassium": 7, "Moisture": 6, "Rainfall": 100, "Temperature": 2},
        }

        adjustment = crop_adjustment[crop]
        row = {
            "Nitrogen": float(rng.uniform(*profile["Nitrogen"]) + adjustment["Nitrogen"]),
            "Phosphorus": float(rng.uniform(*profile["Phosphorus"]) + adjustment["Phosphorus"]),
            "Potassium": float(rng.uniform(*profile["Potassium"]) + adjustment["Potassium"]),
            "pH": float(rng.uniform(*profile["pH"])),
            "Moisture": float(rng.uniform(*profile["Moisture"]) + adjustment["Moisture"]),
            "Crop_Type": crop,
            "Rainfall": float(rng.uniform(*profile["Rainfall"]) + adjustment["Rainfall"]),
            "Temperature": float(rng.uniform(*profile["Temperature"]) + adjustment["Temperature"]),
            "Fertilizer": fertilizer,
        }

        data.append(row)

    df = pd.DataFrame(data)
    df["Nitrogen"] = df["Nitrogen"].round(2)
    df["Phosphorus"] = df["Phosphorus"].round(2)
    df["Potassium"] = df["Potassium"].round(2)
    df["pH"] = df["pH"].round(2)
    df["Moisture"] = df["Moisture"].round(2)
    df["Rainfall"] = df["Rainfall"].round(2)
    df["Temperature"] = df["Temperature"].round(2)
    return df


def main() -> None:
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    df = generate_dataset()
    df = df[FEATURE_COLUMNS + [TARGET_COLUMN]]
    df.to_csv(DATA_FILE, index=False)
    print(f"Created synthetic dataset at: {DATA_FILE}")
    print(df.head().to_string(index=False))
    print(f"Rows: {len(df)}, Classes: {sorted(df[TARGET_COLUMN].unique().tolist())}")


if __name__ == "__main__":
    main()
