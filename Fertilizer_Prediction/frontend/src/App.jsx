import { useEffect, useMemo, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const cropOptions = ['Rice', 'Wheat', 'Maize', 'Cotton', 'Sugarcane', 'Soybean', 'Potato', 'Barley'];
const defaultForm = {
  Nitrogen: 120,
  Phosphorus: 55,
  Potassium: 75,
  pH: 6.6,
  Moisture: 52,
  Crop_Type: 'Rice',
  Rainfall: 900,
  Temperature: 27,
};

const fieldConfig = [
  { key: 'Nitrogen', label: 'Nitrogen (N)', min: 0, max: 250, unit: 'kg/ha', placeholder: '120' },
  { key: 'Phosphorus', label: 'Phosphorus (P)', min: 0, max: 200, unit: 'kg/ha', placeholder: '55' },
  { key: 'Potassium', label: 'Potassium (K)', min: 0, max: 220, unit: 'kg/ha', placeholder: '75' },
  { key: 'pH', label: 'Soil pH', min: 3, max: 9.5, unit: '', placeholder: '6.6' },
  { key: 'Moisture', label: 'Soil Moisture', min: 0, max: 100, unit: '%', placeholder: '52' },
  { key: 'Crop_Type', label: 'Crop Type', min: 0, max: 0, unit: '', placeholder: '' },
  { key: 'Rainfall', label: 'Rainfall', min: 0, max: 2000, unit: 'mm', placeholder: '900' },
  { key: 'Temperature', label: 'Temperature', min: 0, max: 60, unit: '°C', placeholder: '27' },
];

function fetchJson(url, options = {}) {
  return fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  }).then(async (response) => {
    const contentType = response.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await response.json() : await response.text();
    if (!response.ok) {
      const message = typeof data === 'string' ? data : data.error || 'Request failed';
      throw new Error(message);
    }
    return data;
  });
}

function validateForm(values) {
  const errors = {};
  fieldConfig.forEach((field) => {
    const value = values[field.key];
    if (field.key === 'Crop_Type') {
      if (!value || !cropOptions.includes(value)) {
        errors[field.key] = 'Select a valid crop type.';
      }
      return;
    }

    const numValue = Number(value);
    if (value === '' || value === null || value === undefined || Number.isNaN(numValue) || !Number.isFinite(numValue)) {
      errors[field.key] = 'Enter a valid numeric value.';
      return;
    }

    if (numValue < field.min || numValue > field.max) {
      errors[field.key] = `Value should be between ${field.min} and ${field.max}${field.unit ? ` ${field.unit}` : ''}.`;
    }
  });

  return errors;
}

function Layout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <img src="/logo.svg" alt="FertilizerAI logo" className="brand-logo" />
          <div>
            <div className="brand-name">FertilizerAI</div>
            <small className="brand-tag">Smarter Fertilizer Decisions for Sustainable Agriculture</small>
          </div>
        </div>

        <nav className="nav-menu" aria-label="Main navigation">
          <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Home
          </NavLink>
          <NavLink to="/dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Dashboard
          </NavLink>
          <NavLink to="/metrics" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            Model Performance
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
            About
          </NavLink>
        </nav>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/dashboard" element={<PredictionDashboard />} />
          <Route path="/results" element={<PredictionResults />} />
          <Route path="/metrics" element={<PerformancePage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="landing-grid">
      <section className="hero-panel">
        <div className="eyebrow">Precision Agriculture Dashboard</div>
        <h1>Smart fertilizer decisions for healthier crops and better yields.</h1>
        <p>
          FertilizerAI uses regularized logistic regression to analyse soil fertility, crop type, and climate conditions to suggest the most suitable fertilizer for the field.
        </p>

        <div className="cta-row">
          <button className="primary-btn" onClick={() => navigate('/dashboard')}>
            Predict Fertilizer
          </button>
          <button className="secondary-btn" onClick={() => navigate('/metrics')}>
            View Model Performance
          </button>
        </div>

        <div className="mini-stat-grid">
          <div className="mini-stat">
            <strong>8</strong>
            <span>Input parameters</span>
          </div>
          <div className="mini-stat">
            <strong>2</strong>
            <span>Regularized models</span>
          </div>
          <div className="mini-stat">
            <strong>1</strong>
            <span>Decision dashboard</span>
          </div>
        </div>
      </section>

      <section className="visual-card glass-card">
        <div className="chart-card-head">
          <span className="badge badge-success">Agriculture Insight</span>
        </div>

        <div className="illustration-box">
          <div className="leaf-scene">
            <div className="field-plot">
              <span className="plot-row row-1" />
              <span className="plot-row row-2" />
              <span className="plot-row row-3" />
            </div>
            <div className="sun" />
            <div className="plant plant-1" />
            <div className="plant plant-2" />
            <div className="plant plant-3" />
          </div>
        </div>
      </section>

      <section className="feature-panel">
        <div className="info-card">
          <h3>How it works</h3>
          <p>The model checks nutrient balance, rainfall, moisture, pH, temperature, and crop selection before suggesting a fertilizer profile.</p>
        </div>
        <div className="info-card">
          <h3>Why it matters</h3>
          <p>It helps reduce fertilizer waste, lower input cost, and support more sustainable farm management decisions.</p>
        </div>
        <div className="info-card">
          <h3>Project features</h3>
          <p>Real model evaluation, responsive dashboard, prediction explanations, and clear reporting of model confidence.</p>
        </div>
      </section>
    </div>
  );
}

function PredictionDashboard() {
  const navigate = useNavigate();
  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [localErrors, setLocalErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setLocalErrors((current) => ({ ...current, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        Nitrogen: Number(form.Nitrogen),
        Phosphorus: Number(form.Phosphorus),
        Potassium: Number(form.Potassium),
        pH: Number(form.pH),
        Moisture: Number(form.Moisture),
        Rainfall: Number(form.Rainfall),
        Temperature: Number(form.Temperature),
      };

      const result = await fetchJson('/api/predict', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      navigate('/results', { state: { prediction: result } });
    } catch (requestError) {
      setError(requestError.message || 'Unable to reach the backend service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(defaultForm);
    setLocalErrors({});
    setError('');
  };

  return (
    <div className="dashboard-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Prediction Dashboard</span>
          <h2>Fertilizer recommendation input</h2>
        </div>
      </div>

      <div className="dashboard-grid">
        <form onSubmit={handleSubmit} className="dashboard-form glass-card">
          <div className="row gy-3">
            {fieldConfig.map((field) => (
              <div key={field.key} className="col-md-6">
                <label htmlFor={field.key} className="field-label">
                  {field.label}
                </label>
                {field.key === 'Crop_Type' ? (
                  <select
                    id={field.key}
                    name={field.key}
                    value={form[field.key]}
                    onChange={handleChange}
                    className={localErrors[field.key] ? 'form-control is-invalid' : 'form-control'}
                  >
                    {cropOptions.map((crop) => (
                      <option key={crop} value={crop}>{crop}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={field.key}
                    name={field.key}
                    type="number"
                    step={field.key === 'pH' ? '0.1' : '1'}
                    min={field.min}
                    max={field.max}
                    value={form[field.key]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className={localErrors[field.key] ? 'form-control is-invalid' : 'form-control'}
                  />
                )}
                {localErrors[field.key] && <div className="field-error">{localErrors[field.key]}</div>}
              </div>
            ))}
          </div>

          <div className="button-row">
            <button type="submit" className="primary-btn" disabled={loading}>
              {loading ? 'Predicting...' : 'Predict Fertilizer'}
            </button>
            <button type="button" className="secondary-btn" onClick={handleReset}>
              Reset
            </button>
          </div>

          {error && <div className="alert-box danger">{error}</div>}
        </form>

        <aside className="insight-card glass-card">
          <h3>Field health overview</h3>
          <ul>
            <li>Nitrogen and phosphorus support crop vigor and root development.</li>
            <li>Potassium improves water-use efficiency and stress tolerance.</li>
            <li>Soil pH strongly influences nutrient uptake and microbial health.</li>
            <li>Moisture and rainfall help interpret irrigation and climate-related fertilizer demand.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}

function PredictionResults() {
  const navigate = useNavigate();
  const location = useLocation();
  const prediction = location.state?.prediction;

  if (!prediction) {
    return (
      <div className="empty-state glass-card">
        <h3>No prediction result available.</h3>
        <p>Please run a prediction from the dashboard to see recommendation details.</p>
        <button className="primary-btn" onClick={() => navigate('/dashboard')}>Open Dashboard</button>
      </div>
    );
  }

  const radarData = [
    { metric: 'Nitrogen', value: prediction.inputs.Nitrogen / 2 },
    { metric: 'Phosphorus', value: prediction.inputs.Phosphorus / 2 },
    { metric: 'Potassium', value: prediction.inputs.Potassium / 2 },
    { metric: 'Moisture', value: prediction.inputs.Moisture },
    { metric: 'Rainfall', value: prediction.inputs.Rainfall / 12 },
    { metric: 'Temperature', value: prediction.inputs.Temperature / 2 },
  ];

  const probabilityData = prediction.probabilities.map((item) => ({
    name: item.label,
    probability: item.probability,
  }));

  return (
    <div className="results-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Prediction Results</span>
          <h2>Recommended fertilizer</h2>
        </div>
      </div>

      <div className="result-panel glass-card">
        <div className="result-top-row">
          <div>
            <div className="result-label">Predicted fertilizer</div>
            <h3>{prediction.predicted_fertilizer}</h3>
          </div>
          <div className="confidence-badge">
            Confidence <strong>{prediction.confidence}</strong>
          </div>
        </div>

        <p className="result-explanation">{prediction.explanation}</p>

        <div className="result-grid">
          <div className="result-card">
            <h4>Input summary</h4>
            <ul className="summary-list">
              {Object.entries(prediction.inputs).map(([key, value]) => (
                <li key={key}><span>{key}</span><strong>{String(value)}</strong></li>
              ))}
            </ul>
          </div>

          <div className="result-card">
            <h4>Model used</h4>
            <p>{prediction.model_used}</p>
            <h4>Prediction confidence</h4>
            <p>Class probabilities are model-derived and should be interpreted as relative confidence, not guaranteed agricultural certainty.</p>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card glass-card">
          <h4>Field condition profile</h4>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar name="Field" dataKey="value" stroke="#2e7d32" fill="#2e7d32" fillOpacity={0.45} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-card">
          <h4>Probability distribution</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={probabilityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" interval={0} angle={-25} textAnchor="end" height={70} />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Bar dataKey="probability" radius={[8, 8, 0, 0]} fill="#2e7d32">
                {probabilityData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={index % 2 === 0 ? '#2e7d32' : '#81c784'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="button-row">
        <button className="primary-btn" onClick={() => navigate('/dashboard')}>Make Another Prediction</button>
      </div>
    </div>
  );
}

function PerformancePage() {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        const data = await fetchJson('/api/metrics');
        setMetrics(data);
      } catch (error) {
        setError(error.message || 'Unable to load model metrics.');
      } finally {
        setLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (loading) {
    return <div className="empty-state glass-card"><h3>Loading model evaluation...</h3></div>;
  }

  if (error) {
    return <div className="empty-state glass-card"><h3>Unable to load results</h3><p>{error}</p></div>;
  }

  const comparisonData = [
    { metric: 'Accuracy', L1: metrics.l1.accuracy, L2: metrics.l2.accuracy },
    { metric: 'Precision (macro)', L1: metrics.l1.precision_macro, L2: metrics.l2.precision_macro },
    { metric: 'Recall (macro)', L1: metrics.l1.recall_macro, L2: metrics.l2.recall_macro },
    { metric: 'F1 (macro)', L1: metrics.l1.f1_macro, L2: metrics.l2.f1_macro },
  ];

  const confusionMatrix = metrics.confusion_matrix || [];
  const labels = metrics.confusion_labels || [];

  return (
    <div className="performance-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">Model Performance Dashboard</span>
          <h2>Evaluation for regularized logistic regression</h2>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <span>L1 Logistic Regression</span>
          <strong>{metrics.l1.accuracy}</strong>
          <small>Accuracy</small>
        </div>
        <div className="metric-card glass-card">
          <span>L2 Logistic Regression</span>
          <strong>{metrics.l2.accuracy}</strong>
          <small>Accuracy</small>
        </div>
        <div className="metric-card glass-card">
          <span>Selected model</span>
          <strong>{metrics.selected_model}</strong>
          <small>Best F1 score</small>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card glass-card">
          <h4>Model comparison</h4>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={comparisonData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis domain={[0, 1.1]} />
              <Tooltip />
              <Bar dataKey="L1" fill="#2e7d32" radius={[8, 8, 0, 0]} />
              <Bar dataKey="L2" fill="#81c784" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card glass-card">
          <h4>Confusion matrix</h4>
          <div className="matrix-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th></th>
                  {labels.map((label) => <th key={label}>{label.slice(0, 8)}</th>)}
                </tr>
              </thead>
              <tbody>
                {confusionMatrix.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <th>{labels[rowIndex].slice(0, 8)}</th>
                    {row.map((value, colIndex) => (
                      <td key={`${rowIndex}-${colIndex}`}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="table-card glass-card">
        <h4>Detailed metric summary</h4>
        <table className="metric-table">
          <thead>
            <tr>
              <th>Metric</th>
              <th>L1 Model</th>
              <th>L2 Model</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries({ accuracy: 'Accuracy', precision_macro: 'Precision (macro)', recall_macro: 'Recall (macro)', f1_macro: 'F1 (macro)' }).map(([key, label]) => (
              <tr key={key}>
                <td>{label}</td>
                <td>{metrics.l1[key]}</td>
                <td>{metrics.l2[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AboutPage() {
  return (
    <div className="about-shell">
      <div className="section-header">
        <div>
          <span className="eyebrow">About the Project</span>
          <h2>Addressing nutrient management challenges in agriculture</h2>
        </div>
      </div>

      <div className="about-grid">
        <div className="glass-card info-block">
          <h3>The agricultural problem</h3>
          <p>Farmers often face uncertainty about fertilizer choice when soil nutrient levels, moisture, pH, climate, and crop type vary simultaneously. Over-application leads to waste and environmental burden, while under-application reduces yield potential.</p>
        </div>
        <div className="glass-card info-block">
          <h3>Project objectives</h3>
          <p>This project demonstrates how data-driven regularized logistic regression can classify suitable fertilizers using fundamental agronomic variables and a clean predictive pipeline suited for academic demonstrations.</p>
        </div>
        <div className="glass-card info-block">
          <h3>Importance of N-P-K nutrients</h3>
          <p>Nitrogen supports leafy growth, phosphorus strengthens root and reproductive development, and potassium improves stress resistance, disease tolerance, and water regulation.</p>
        </div>
        <div className="glass-card info-block">
          <h3>Role of soil pH and climate</h3>
          <p>Soil pH affects nutrient availability, while rainfall, temperature, and moisture conditions influence plant uptake and nutrient demand. These variables are essential to accurate fertilizer recommendation.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return <Layout />;
}
