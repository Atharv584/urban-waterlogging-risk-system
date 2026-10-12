import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts'
import {
  CloudRain, Droplets, Mountain, Activity, Layers, Building2,
  ClipboardList, Gauge, Brain, AlertTriangle, BarChart3, Send,
  ChevronRight, Shield, TreePine, Zap,
} from 'lucide-react'
import { predict, getModelInfo, healthCheck } from './api'
import {
  PredictionInput, PredictionResponse, ModelInfo, RiskLevel,
  RISK_COLORS, FEATURE_LABELS, FEATURE_RANGES, DEFAULT_INPUT,
} from './types'

/* ── Risk helpers ─────────────────────────────────────────── */
const RISK_CLASS: Record<RiskLevel, string> = { Low: 'low', Medium: 'med', High: 'high' }

const RISK_BAR_COLOR: Record<RiskLevel, string> = {
  Low: '#059669',
  Medium: '#d97706',
  High: '#dc2626',
}

const FIELD_ICONS: Record<string, React.ReactNode> = {
  Rainfall_1h_mm:         <CloudRain   size={15} />,
  Rainfall_24h_mm:        <Droplets    size={15} />,
  Drainage_Capacity_mm_h: <Gauge       size={15} />,
  Elevation_m:            <Mountain    size={15} />,
  Slope_degrees:          <Activity    size={15} />,
  Soil_Saturation_pct:    <Layers      size={15} />,
  Impervious_Surface_pct: <Building2   size={15} />,
  Historical_Waterlogging:<ClipboardList size={15}/>,
}

/* ── Chart palette ────────────────────────────────────────── */
const BAR_COLORS = [
  '#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899','#3b82f6',
]

/* ================================================================
   APP
================================================================ */
export default function App() {
  const [input,    setInput]    = useState<PredictionInput>({ ...DEFAULT_INPUT })
  const [result,   setResult]   = useState<PredictionResponse | null>(null)
  const [modelInfo,setModelInfo]= useState<ModelInfo | null>(null)
  const [loading,  setLoading]  = useState(false)
  const [backendOk,setBackendOk]= useState<boolean | null>(null)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    healthCheck().then(setBackendOk)
    getModelInfo().then(setModelInfo).catch(() => {})
  }, [])

  const handleChange = useCallback((key: keyof PredictionInput, value: number) => {
    setInput(prev => ({ ...prev, [key]: value }))
  }, [])

  const handlePreset = (preset: 'low' | 'med' | 'high') => {
    const presets: Record<string, PredictionInput> = {
      low:  { Rainfall_1h_mm:5,  Rainfall_24h_mm:15,  Drainage_Capacity_mm_h:85, Elevation_m:90, Slope_degrees:12, Soil_Saturation_pct:20, Impervious_Surface_pct:20, Historical_Waterlogging:0 },
      med:  { Rainfall_1h_mm:30, Rainfall_24h_mm:80,  Drainage_Capacity_mm_h:45, Elevation_m:45, Slope_degrees:5,  Soil_Saturation_pct:60, Impervious_Surface_pct:60, Historical_Waterlogging:0 },
      high: { Rainfall_1h_mm:80, Rainfall_24h_mm:200, Drainage_Capacity_mm_h:15, Elevation_m:10, Slope_degrees:1,  Soil_Saturation_pct:92, Impervious_Surface_pct:90, Historical_Waterlogging:1 },
    }
    setInput(presets[preset])
    setResult(null)
    setError(null)
  }

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const res = await predict(input)
      setResult(res)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { detail?: string } }; message?: string }
      setError(e?.response?.data?.detail || e?.message || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="hero">
        <div className="hero-inner">
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div className="hero-logo">
              <Droplets size={24} color="#fff" />
            </div>
            <div>
              <h1 className="hero-title">Urban Waterlogging<br />Risk Prediction</h1>
              <p className="hero-sub">
                ML-powered flood risk assessment · Random Forest Classifier · 10,000 synthetic observations
              </p>
            </div>
          </div>
          <StatusPill ok={backendOk} />
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────── */}
      <div className="page-wrapper">

        {/* Disclaimer */}
        <div className="disclaimer fade-up">
          <AlertTriangle size={18} className="disclaimer-icon" />
          <div>
            <p className="disclaimer-title">⚠ Synthetic Data — Academic Use Only</p>
            <p className="disclaimer-body">
              This model is trained exclusively on <strong>synthetic data (10,000 generated observations)</strong>.
              It is <strong>NOT validated for real-world emergency decisions</strong>.
              Do not rely on these predictions for actual flood risk management or public safety.
            </p>
          </div>
        </div>

        {/* Presets */}
        <div className="presets-row fade-up d1">
          <span className="presets-label">Quick scenarios:</span>
          {([
            { key:'low',  label:'Low Risk',    emoji:'🟢' },
            { key:'med',  label:'Medium Risk',  emoji:'🟡' },
            { key:'high', label:'High Risk',    emoji:'🔴' },
          ] as const).map(p => (
            <button
              key={p.key}
              className={`preset-chip ${p.key}`}
              onClick={() => handlePreset(p.key)}
            >
              {p.emoji} {p.label} Scenario
            </button>
          ))}
        </div>

        {/* Main grid */}
        <div className="main-grid">

          {/* ── LEFT: Input form ─────────────────────────── */}
          <div className="fade-up d2">
            <InputForm
              input={input}
              onChange={handleChange}
              onSubmit={handleSubmit}
              loading={loading}
            />
          </div>

          {/* ── RIGHT: Results ───────────────────────────── */}
          <div className="fade-up d3">
            {error && (
              <div className="error-banner" style={{ marginBottom: 20 }}>
                <AlertTriangle size={18} color="#dc2626" style={{ flexShrink:0, marginTop:1 }} />
                <div>
                  <p className="error-banner-title">Prediction Error</p>
                  <p className="error-banner-body">{error}</p>
                </div>
              </div>
            )}

            {result ? (
              <div className="results-stack">
                <RiskResult result={result} />
                <div className="charts-row">
                  <ProbabilityChart result={result} />
                  <ImportanceChart result={result} />
                </div>
                <EnvSummaryChart result={result} />
              </div>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>

        {/* ── Model Info ───────────────────────────────── */}
        <div className="model-section fade-up d4">
          <h2 className="section-heading">
            <span style={{ color:'#6366f1', display:'flex', alignItems:'center' }}>
              <Brain size={20} />
            </span>
            Model Information
          </h2>
          <ModelStats modelInfo={modelInfo} />

          <div className="disclaimer" style={{ marginTop:16, background:'#fef9ee', borderColor:'#fde68a' }}>
            <AlertTriangle size={16} className="disclaimer-icon" />
            <p className="disclaimer-body">
              <strong>Data source: Synthetic (10,000 observations).</strong>{' '}
              Random Forest trained with scikit-learn. For academic demonstration only.
              Not suitable for real-world emergency use.
            </p>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer fade-up d5">
          <p>
            <Droplets size={13} color="#94a3b8" />
            Urban Waterlogging Risk Prediction System
            <span className="footer-dot" />
            College Project Demo
            <span className="footer-dot" />
            Random Forest · scikit-learn
            <span className="footer-dot" />
            81.3% Test Accuracy
          </p>
        </footer>
      </div>
    </div>
  )
}

/* ── Status Pill ─────────────────────────────────────────────── */
function StatusPill({ ok }: { ok: boolean | null }) {
  const cls = ok === true ? 'online' : ok === false ? 'offline' : 'pending'
  const dotColor = ok === true ? '#6ee7b7' : ok === false ? '#fca5a5' : '#fcd34d'
  const label = ok === true ? 'API Online' : ok === false ? 'API Offline' : 'Checking…'
  return (
    <div className={`status-pill ${cls}`} style={{ alignSelf:'flex-start' }}>
      <span className="status-dot" style={{ background: dotColor }} />
      {label}
    </div>
  )
}

/* ── Input Form ──────────────────────────────────────────────── */
function InputForm({
  input, onChange, onSubmit, loading,
}: {
  input: PredictionInput
  onChange: (key: keyof PredictionInput, val: number) => void
  onSubmit: () => void
  loading: boolean
}) {
  const SLIDER_KEYS = Object.keys(FEATURE_LABELS).filter(k => k !== 'Historical_Waterlogging') as (keyof PredictionInput)[]

  return (
    <div className="card" style={{ position:'sticky', top:24 }}>
      <div className="card-header">
        <div className="card-icon"><Zap size={17} /></div>
        <h2 className="card-title">Environmental Parameters</h2>
      </div>
      <div className="card-body">
        {/* Sliders */}
        {SLIDER_KEYS.map(key => {
          const range = FEATURE_RANGES[key]
          const pct   = ((input[key] - range.min) / (range.max - range.min)) * 100
          return (
            <div className="form-field" key={key}>
              <div className="field-row">
                <label className="field-label">
                  <span className="field-label-icon">{FIELD_ICONS[key]}</span>
                  {FEATURE_LABELS[key]}
                </label>
                <span className="field-value">{input[key]}{range.unit}</span>
              </div>
              <div className="range-track-wrap">
                <input
                  type="range"
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  value={input[key]}
                  onChange={e => onChange(key, parseFloat(e.target.value))}
                  style={{
                    background: `linear-gradient(to right,
                      #6366f1 0%, #6366f1 ${pct}%,
                      #e0e7ff ${pct}%, #e0e7ff 100%)`,
                  }}
                />
              </div>
              <div className="range-ticks">
                <span>{range.min}{range.unit}</span>
                <span>{range.max}{range.unit}</span>
              </div>
            </div>
          )
        })}

        {/* Historical Waterlogging toggle */}
        <div className="form-field">
          <label className="field-label" style={{ marginBottom:10 }}>
            <span className="field-label-icon">{FIELD_ICONS.Historical_Waterlogging}</span>
            {FEATURE_LABELS.Historical_Waterlogging}
          </label>
          <div className="toggle-row">
            <div
              className={`toggle ${input.Historical_Waterlogging === 1 ? 'on' : ''}`}
              onClick={() => onChange('Historical_Waterlogging', input.Historical_Waterlogging === 1 ? 0 : 1)}
            />
            <span className="toggle-label" style={{ color: input.Historical_Waterlogging === 1 ? '#4f46e5' : undefined, fontWeight: input.Historical_Waterlogging === 1 ? 700 : 500 }}>
              {input.Historical_Waterlogging === 1 ? 'Yes — prior flooding recorded' : 'No — no prior flooding'}
            </span>
          </div>
        </div>

        <hr className="divider" style={{ margin: '20px 0' }} />

        <button className="btn-submit" onClick={onSubmit} disabled={loading}>
          {loading
            ? <><div className="spinner" /> Analyzing…</>
            : <><Send size={16} /> Predict Waterlogging Risk</>
          }
        </button>
      </div>
    </div>
  )
}

/* ── Empty State ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <div className="empty-state fade-in">
      <div className="empty-icon-wrap">
        <BarChart3 size={36} />
      </div>
      <h3 className="empty-title">Ready for Analysis</h3>
      <p className="empty-sub">
        Adjust the environmental parameters on the left, or pick a quick scenario above, then click
        <strong style={{ color:'#4f46e5' }}> Predict Waterlogging Risk</strong>.
      </p>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:20, color:'#94a3b8', fontSize:'.8125rem', fontWeight:600 }}>
        <ChevronRight size={15} />
        Choose a preset scenario to get started instantly
      </div>
    </div>
  )
}

/* ── Risk Result ─────────────────────────────────────────────── */
function RiskResult({ result }: { result: PredictionResponse }) {
  const risk      = result.prediction as RiskLevel
  const cls       = RISK_CLASS[risk]
  const confidence= Math.max(...Object.values(result.probabilities)) * 100
  const riskColor = RISK_BAR_COLOR[risk]

  const ALL_RISKS: RiskLevel[] = ['Low', 'Medium', 'High']

  return (
    <div className="card risk-card fade-in">
      <p className="risk-label-sm">Predicted Waterlogging Risk</p>
      <div className="risk-card-top">
        <div>
          <span className={`risk-badge ${cls}`}>
            <Shield size={16} />
            {risk} Risk
          </span>
        </div>
        <div className="confidence-block">
          <p className="confidence-num" style={{ color: riskColor }}>
            {confidence.toFixed(1)}%
          </p>
          <p className="confidence-tag">Model Confidence</p>
        </div>
      </div>

      {/* Bar indicators */}
      <div className="risk-bars">
        {ALL_RISKS.map(level => {
          const prob = (result.probabilities[level] ?? 0) * 100
          return (
            <div className={`risk-bar-item ${level === risk ? 'active' : ''}`} key={level}>
              <p className="risk-bar-label">{level}</p>
              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${prob}%`,
                    background: RISK_BAR_COLOR[level],
                    opacity: level === risk ? 1 : 0.4,
                  }}
                />
              </div>
              <p style={{ fontSize:'.7rem', textAlign:'center', marginTop:4, color:'#64748b', fontWeight:600 }}>
                {prob.toFixed(1)}%
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Probability Pie ─────────────────────────────────────────── */
function ProbabilityChart({ result }: { result: PredictionResponse }) {
  const data = Object.entries(result.probabilities).map(([name, value]) => ({
    name,
    value: parseFloat((value * 100).toFixed(1)),
    fill: RISK_COLORS[name as RiskLevel],
  }))

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-icon"><BarChart3 size={16} /></div>
        <h3 className="card-title" style={{ fontSize:'.9375rem' }}>Class Probabilities</h3>
      </div>
      <div className="chart-card-body" style={{ paddingTop:0 }}>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" innerRadius={52} outerRadius={82}
              paddingAngle={4} dataKey="value" stroke="none">
              {data.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v}%`, '']}
              contentStyle={{ background:'#fff', border:'1px solid #e8edf4', borderRadius:10, fontSize:13 }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          {data.map(d => (
            <div className="legend-item" key={d.name}>
              <span className="legend-dot" style={{ background: d.fill }} />
              {d.name}: {d.value}%
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── Feature Importance Radar ────────────────────────────────── */
function ImportanceChart({ result }: { result: PredictionResponse }) {
  const data = Object.entries(result.feature_importances).map(([key, value]) => ({
    feature: FEATURE_LABELS[key]?.replace(/\s*\(.*?\)/g, '') || key,
    importance: parseFloat((value * 100).toFixed(1)),
  }))

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-icon"><Brain size={16} /></div>
        <h3 className="card-title" style={{ fontSize:'.9375rem' }}>Feature Importance</h3>
      </div>
      <div className="chart-card-body" style={{ paddingTop:0 }}>
        <ResponsiveContainer width="100%" height={200}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e8edf4" />
            <PolarAngleAxis dataKey="feature"
              tick={{ fontSize:10, fill:'#334155', fontWeight:600 }} />
            <PolarRadiusAxis tick={false} axisLine={false} />
            <Radar name="Importance" dataKey="importance"
              stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
            <Tooltip
              contentStyle={{ background:'#fff', border:'1px solid #e8edf4', borderRadius:10, fontSize:13 }}
              formatter={(v: number) => [`${v}%`, 'Importance']} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Environment Bar Chart ───────────────────────────────────── */
function EnvSummaryChart({ result }: { result: PredictionResponse }) {
  const data = Object.entries(result.input_summary).map(([key, value]) => {
    const range = FEATURE_RANGES[key]
    const pct   = range ? ((value - range.min) / (range.max - range.min)) * 100 : value
    return {
      name: FEATURE_LABELS[key]?.replace(/\s*\(.*?\)/g, '') || key,
      value: parseFloat(pct.toFixed(1)),
      raw: value,
      unit: range?.unit || '',
    }
  })

  return (
    <div className="card fade-in">
      <div className="card-header">
        <div className="card-icon"><TreePine size={16} /></div>
        <h3 className="card-title" style={{ fontSize:'.9375rem' }}>Environmental Parameter Summary</h3>
      </div>
      <div className="chart-card-body" style={{ paddingTop:0 }}>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} layout="vertical" margin={{ left:16, right:24, top:4, bottom:4 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize:12, fill:'#64748b', fontWeight:500 }}
              tickFormatter={v => `${v}%`} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" width={130}
              tick={{ fontSize:12, fill:'#1e293b', fontWeight:600 }}
              axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background:'#fff', border:'1px solid #e8edf4', borderRadius:10, fontSize:13 }}
              formatter={(_v: number, _n: string, props: { payload?: { raw?: number; unit?: string; value?: number } }) => {
                const p = props.payload
                return p ? [`${p.raw} ${p.unit} (${p.value}% of range)`, ''] : ['', '']
              }}
            />
            <Bar dataKey="value" radius={[0, 8, 8, 0]} maxBarSize={20}>
              {data.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/* ── Model Stats ─────────────────────────────────────────────── */
function ModelStats({ modelInfo }: { modelInfo: ModelInfo | null }) {
  if (!modelInfo) {
    return (
      <div className="model-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="shimmer" style={{ height: 100 }} />
        ))}
      </div>
    )
  }

  const stats = [
    { icon: <Brain size={20} />, label: 'Algorithm',     value: 'Random Forest' },
    { icon: <Layers size={20} />, label: 'Estimators',   value: `${modelInfo.n_estimators} trees` },
    { icon: <Activity size={20} />, label: 'Test Accuracy', value: `${(modelInfo.test_accuracy * 100).toFixed(2)}%` },
    { icon: <BarChart3 size={20} />, label: 'Training Data', value: `${modelInfo.training_samples.toLocaleString()} samples` },
  ]

  return (
    <div className="model-stats">
      {stats.map(s => (
        <div className="model-stat" key={s.label}>
          <div className="model-stat-icon">{s.icon}</div>
          <p className="model-stat-label">{s.label}</p>
          <p className="model-stat-value">{s.value}</p>
        </div>
      ))}
    </div>
  )
}
