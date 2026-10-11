# FertilizerAI

FertilizerAI is a full-stack agriculture prediction project that recommends fertilizer using regularized logistic regression with L1 and L2 penalty terms. The application includes a Flask REST API and a React + Vite dashboard for prediction, evaluation, and reporting.

## Included project artifacts

The project also preserves the notebook work and model artifacts that were provided in the project files:

- `backend/project_artifacts/Main_Project.ipynb`
- `backend/project_artifacts/Regularised_Logistic_Regression.ipynb`
- `backend/project_artifacts/Project_EDA.ipynb`
- `backend/models/fertilizer_model.pkl`
- `backend/models/scaler.pkl`

These are stored as reference material and demonstration assets for the academic project workflow.

## Project structure

- `backend/` — Flask API, dataset generation, model training and evaluation
- `frontend/` — Vite + React dashboard application
- `README.md` — project instructions

## Backend setup

From the project root:

```bash
cd backend
D:\python.exe -m pip install -r requirements.txt
D:\python.exe generate_dataset.py
D:\python.exe train_model.py
D:\python.exe app.py
```

The backend runs on:

- http://localhost:5000/api/health
- http://localhost:5000/api/metrics
- http://localhost:5000/api/predict

## Frontend setup

From the project root:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on:

- http://localhost:5173

## Project concept

This project follows the requirement specification for a B.Tech CSE demonstration project using:

- Regularized logistic regression with L1 and L2 penalties
- Synthetic demonstration dataset generation when needed
- Flask REST API backend
- React frontend with dashboard-style interface
- Model performance reporting with actual evaluation metrics

## Notes

- The demonstration data is synthetic and clearly labeled as such.
- Actual evaluation metrics are generated from the trained test split and are not fabricated.
- The provided notebooks and pickle files are preserved in the repository for traceability and reference.
