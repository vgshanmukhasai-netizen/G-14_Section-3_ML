from __future__ import annotations

import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.feature_extraction import DictVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, confusion_matrix, f1_score, precision_score, recall_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from generate_dataset import DATA_FILE, FEATURE_COLUMNS, FERTILIZER_CLASSES, TARGET_COLUMN, generate_dataset

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "fertilizer_model.joblib"
METRICS_PATH = BASE_DIR / "models" / "model_metrics.json"

REQUIRED_COLUMNS = FEATURE_COLUMNS + [TARGET_COLUMN]


def validate_dataset(df: pd.DataFrame) -> pd.DataFrame:
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Dataset is missing required columns: {missing_cols}")

    df = df.copy()
    df = df.drop_duplicates().reset_index(drop=True)

    for col in ["Nitrogen", "Phosphorus", "Potassium", "pH", "Moisture", "Rainfall", "Temperature"]:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df["Crop_Type"] = df["Crop_Type"].astype(str).str.strip()
    df[TARGET_COLUMN] = df[TARGET_COLUMN].astype(str).str.strip()

    df = df[df["Crop_Type"].notna() & df[TARGET_COLUMN].notna()]
    df = df.dropna(subset=["Nitrogen", "Phosphorus", "Potassium", "pH", "Moisture", "Crop_Type", "Rainfall", "Temperature", TARGET_COLUMN]).reset_index(drop=True)

    missing_labels = sorted(set(FERTILIZER_CLASSES) - set(df[TARGET_COLUMN].unique()))
    if missing_labels:
        raise ValueError(f"Dataset is missing fertilizer labels: {missing_labels}")

    return df


def build_preprocessor() -> ColumnTransformer:
    numeric_features = ["Nitrogen", "Phosphorus", "Potassium", "pH", "Moisture", "Rainfall", "Temperature"]
    categorical_features = ["Crop_Type"]

    numeric_transformer = Pipeline(steps=[("scaler", StandardScaler())])
    categorical_transformer = Pipeline(steps=[("onehot", OneHotEncoder(handle_unknown="ignore"))])

    return ColumnTransformer(
        transformers=[
            ("num", numeric_transformer, numeric_features),
            ("cat", categorical_transformer, categorical_features),
        ]
    )


def evaluate_model(y_true: pd.Series, y_pred: np.ndarray) -> dict:
    return {
        "accuracy": round(float(accuracy_score(y_true, y_pred)), 4),
        "precision_macro": round(float(precision_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "recall_macro": round(float(recall_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "f1_macro": round(float(f1_score(y_true, y_pred, average="macro", zero_division=0)), 4),
        "precision_weighted": round(float(precision_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "recall_weighted": round(float(recall_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
        "f1_weighted": round(float(f1_score(y_true, y_pred, average="weighted", zero_division=0)), 4),
    }


def train_and_save_models() -> dict:
    dataset_path = DATA_FILE
    if not dataset_path.exists():
        from generate_dataset import main as generate_main
        generate_main()

    df = pd.read_csv(dataset_path)
    df = validate_dataset(df)

    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.25,
        random_state=42,
        stratify=y,
    )

    models = {}
    model_results = {}

    for penalty in ["l1", "l2"]:
        pipeline = Pipeline(
            steps=[
                ("preprocessor", build_preprocessor()),
                (
                    "model",
                    LogisticRegression(
                        penalty=penalty,
                        solver="liblinear",
                        C=1.0,
                        max_iter=5000,
                        random_state=42,
                    ),
                ),
            ]
        )

        pipeline.fit(X_train, y_train)
        y_pred = pipeline.predict(X_test)
        metrics = evaluate_model(y_test, y_pred)
        confusion = confusion_matrix(y_test, y_pred, labels=FERTILIZER_CLASSES)
        models[f"{penalty.upper()}_LogisticRegression"] = pipeline
        model_results[f"{penalty.upper()}_LogisticRegression"] = {
            "metrics": metrics,
            "confusion_matrix": confusion,
            "labels": FERTILIZER_CLASSES,
        }

    best_name = max(
        model_results,
        key=lambda name: model_results[name]["metrics"]["f1_macro"],
    )

    bundle = {
        "feature_columns": FEATURE_COLUMNS,
        "target_column": TARGET_COLUMN,
        "all_classes": FERTILIZER_CLASSES,
        "selected_model": best_name,
        "models": {"l1": models["L1_LogisticRegression"], "l2": models["L2_LogisticRegression"]},
        "metrics": {
            "l1": model_results["L1_LogisticRegression"]["metrics"],
            "l2": model_results["L2_LogisticRegression"]["metrics"],
            "selected_model": best_name,
        },
        "confusion_matrix": model_results[best_name]["confusion_matrix"].tolist(),
        "confusion_labels": FERTILIZER_CLASSES,
        "description": "Synthetic demonstration dataset generated for educational evaluation of fertilizer selection models.",
    }

    MODEL_PATH.parent.mkdir(exist_ok=True, parents=True)
    joblib.dump(bundle, MODEL_PATH)

    with METRICS_PATH.open("w", encoding="utf-8") as f:
        json.dump({
            "selected_model": best_name,
            "l1": model_results["L1_LogisticRegression"]["metrics"],
            "l2": model_results["L2_LogisticRegression"]["metrics"],
            "labels": FERTILIZER_CLASSES,
            "confusion_matrix": model_results[best_name]["confusion_matrix"].tolist(),
        }, f, indent=2)

    return bundle


def load_or_train_models() -> dict:
    if MODEL_PATH.exists():
        bundle = joblib.load(MODEL_PATH)
        if isinstance(bundle, dict) and "selected_model" in bundle:
            return bundle

    return train_and_save_models()


def get_model_metadata() -> dict:
    bundle = load_or_train_models()
    return {
        "project_name": "FertilizerAI",
        "tagline": "Smarter Fertilizer Decisions for Sustainable Agriculture",
        "dataset_source": "Synthetic demonstration dataset generated for this project.",
        "feature_columns": bundle["feature_columns"],
        "target_column": bundle["target_column"],
        "class_labels": bundle["all_classes"],
        "selected_model": bundle["selected_model"],
        "evaluation": bundle["metrics"],
    }


def predict_fertilizer(payload: dict) -> dict:
    bundle = load_or_train_models()
    selected_name = bundle["selected_model"]
    pipeline = bundle["models"]["l1" if selected_name.startswith("L1") else "l2"]

    required_fields = FEATURE_COLUMNS.copy()
    missing = [field for field in required_fields if field not in payload]
    if missing:
        raise ValueError(f"Missing required fields: {missing}")

    row = {field: payload[field] for field in FEATURE_COLUMNS}
    df = pd.DataFrame([row])

    for col in ["Nitrogen", "Phosphorus", "Potassium", "pH", "Moisture", "Rainfall", "Temperature"]:
        df[col] = pd.to_numeric(df[col], errors="raise")

    if not str(df.loc[0, "Crop_Type"]).strip():
        raise ValueError("Crop_Type cannot be empty.")

    prediction = pipeline.predict(df)[0]
    probabilities = pipeline.predict_proba(df)[0]
    class_index = list(pipeline.classes_).index(prediction)
    confidence = float(probabilities[class_index])

    explanation_map = {
        "Urea": "Urea is recommended when the soil is nitrogen-lean and the crop requires a high nitrogen boost without excessive phosphorus.",
        "DAP": "DAP supports stronger early root establishment and phosphorus-driven growth, especially in moderately nitrogen-deficient soil.",
        "MOP": "MOP is selected when potassium availability is the limiting factor for crop health, flowering, and stress resistance.",
        "NPK_Complex": "NPK complex is a balanced option when nitrogen, phosphorus, and potassium all need coordinated support.",
        "Compost": "Compost is suitable when soil organic matter, moisture retention, and long-term fertility improvement are important.",
        "Organic": "Organic fertilizer is favored for soil health, reduced chemical dependence, and gradual nutrient availability.",
        "Ammonium_Sulfate": "Ammonium sulfate is a suitable choice where acidity support and nitrogen availability are prioritized.",
        "Calcium_Nitrate": "Calcium nitrate is beneficial when a quick nitrogen supply is needed without excessive salinity or potassium concentration.",
    }

    result = {
        "predicted_fertilizer": prediction,
        "confidence": round(confidence, 4),
        "model_used": selected_name,
        "explanation": explanation_map.get(prediction, "This recommendation balances the available nutrient profile and crop requirements."),
        "inputs": row,
        "probabilities": [
            {"label": label, "probability": round(float(prob), 4)} for label, prob in zip(pipeline.classes_, probabilities)
        ],
    }

    return result
