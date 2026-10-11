from flask import Flask, jsonify, request
from flask_cors import CORS

from model_service import get_model_metadata, load_or_train_models, predict_fertilizer

app = Flask(__name__)
CORS(app)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "project": "FertilizerAI",
        "message": "Machine learning backend is running.",
    })


@app.route("/api/metadata", methods=["GET"])
def metadata():
    return jsonify(get_model_metadata())


@app.route("/api/metrics", methods=["GET"])
def metrics():
    bundle = load_or_train_models()
    return jsonify({
        "selected_model": bundle["selected_model"],
        "l1": bundle["metrics"]["l1"],
        "l2": bundle["metrics"]["l2"],
        "labels": bundle["all_classes"],
        "confusion_matrix": bundle["confusion_matrix"],
        "confusion_labels": bundle["confusion_labels"],
    })


@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    if not isinstance(data, dict):
        return jsonify({"error": "Request body must be a JSON object."}), 400

    try:
        result = predict_fertilizer(data)
        return jsonify(result), 200
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:
        return jsonify({"error": f"Prediction failed: {str(exc)}"}), 500


if __name__ == "__main__":
    load_or_train_models()
    app.run(host="0.0.0.0", port=5000, debug=False)
