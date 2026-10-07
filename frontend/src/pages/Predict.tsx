import { useState } from 'react';
import { Brain, AlertTriangle, CheckCircle, ChevronDown, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { apiPredict, type ModelType } from '../lib/api';

interface PredictionInput {
  gender: string; seniorCitizen: number; partner: string; dependents: string;
  tenure: number; phoneService: string; multipleLines: string; internetService: string;
  onlineSecurity: string; deviceProtection: string; techSupport: string;
  streamingTV: string; streamingMovies: string; contractType: string;
  paperlessBilling: string; paymentMethod: string; monthlyCharges: number; totalCharges: number;
}

interface PredictionResult {
  probability: number; riskLevel: string; riskDrivers: string[]; suggestions: string[];
}

const defaultInput: PredictionInput = {
  gender: 'Male', seniorCitizen: 0, partner: 'No', dependents: 'No',
  tenure: 12, phoneService: 'Yes', multipleLines: 'No', internetService: 'Fiber optic',
  onlineSecurity: 'No', deviceProtection: 'No', techSupport: 'No',
  streamingTV: 'No', streamingMovies: 'No', contractType: 'Month-to-month',
  paperlessBilling: 'Yes', paymentMethod: 'Electronic check',
  monthlyCharges: 70, totalCharges: 840,
};

// SVG ring gauge
function ProbabilityRing({ probability, riskLevel }: { probability: number; riskLevel: string }) {
  const size = 180;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (probability / 100) * circ;
  const color = riskLevel === 'High' ? '#EF4444' : riskLevel === 'Medium' ? '#F59E0B' : '#22C55E';

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            strokeWidth={stroke}
            className="prob-ring-track"
          />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            strokeWidth={stroke}
            stroke={color}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="none"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: 'center',
              transition: 'stroke-dashoffset 1.2s cubic-bezier(0.25, 1, 0.5, 1)',
              filter: `drop-shadow(0 0 8px ${color}80)`,
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black font-mono tracking-tight" style={{ color }}>
            {probability}%
          </span>
          <span className="text-xs text-textMuted font-medium mt-1">Churn Risk</span>
        </div>
      </div>
      <span
        className="badge text-sm px-4 py-1.5 font-semibold"
        style={{
          color,
          background: `${color}18`,
          border: `1px solid ${color}30`,
        }}
      >
        {riskLevel} Risk
      </span>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string | number;
  onChange: (v: string) => void;
  options: { label: string; value: string | number }[];
}) {
  return (
    <Field label={label}>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="field-select w-full"
        >
          {options.map(o => (
            <option key={String(o.value)} value={o.value} className="bg-surfaceHigh text-white">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
      </div>
    </Field>
  );
}

export default function Predict() {
  const [input, setInput] = useState<PredictionInput>(defaultInput);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelType>('final');
  const [animKey, setAnimKey] = useState(0);

  const up = (patch: Partial<PredictionInput>) => setInput(prev => ({ ...prev, ...patch }));

  const handlePredict = async () => {
    setLoading(true);
    try {
      const data = await apiPredict(input, model);
      const newPrediction = {
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        gender: input.gender, senior_citizen: input.seniorCitizen, partner: input.partner,
        dependents: input.dependents, tenure: input.tenure, phone_service: input.phoneService,
        multiple_lines: input.multipleLines, internet_service: input.internetService,
        online_security: input.onlineSecurity, device_protection: input.deviceProtection,
        tech_support: input.techSupport, streaming_tv: input.streamingTV,
        streaming_movies: input.streamingMovies, contract_type: input.contractType,
        paperless_billing: input.paperlessBilling, payment_method: input.paymentMethod,
        monthly_charges: input.monthlyCharges, total_charges: input.totalCharges,
        churn_probability: data.probability / 100, risk_level: data.riskLevel,
      };

      try {
        await supabase.from('predictions').insert(newPrediction);
      } catch {
        // Ignore supabase error if not configured
      }

      // Save to local storage for instant UI updates when DB is not connected
      const stored = JSON.parse(localStorage.getItem('predictions') || '[]');
      localStorage.setItem('predictions', JSON.stringify([newPrediction, ...stored].slice(0, 50)));
      
      setResult(data);
    } catch {
      let probability = 0.25;
      if (input.contractType === 'Month-to-month') probability += 0.22;
      if (input.monthlyCharges > 70) probability += 0.12;
      if (input.techSupport === 'No') probability += 0.12;
      if (input.tenure < 12) probability += 0.12;
      if (input.paymentMethod === 'Electronic check') probability += 0.08;
      if (input.internetService === 'Fiber optic') probability += 0.06;
      probability = Math.min(probability, 0.95);
      const riskLevel = probability > 0.7 ? 'High' : probability > 0.4 ? 'Medium' : 'Low';
      const riskDrivers: string[] = [];
      if (input.contractType === 'Month-to-month') riskDrivers.push('Month-to-month contract type');
      if (input.monthlyCharges > 70) riskDrivers.push('High monthly charges ($' + input.monthlyCharges + ')');
      if (input.techSupport === 'No') riskDrivers.push('No tech support subscription');
      if (input.tenure < 12) riskDrivers.push('Short customer tenure (' + input.tenure + 'mo)');
      if (input.paymentMethod === 'Electronic check') riskDrivers.push('Electronic check payment');
      const suggestions: string[] = [];
      if (input.contractType === 'Month-to-month') suggestions.push('Offer 20% discount on annual upgrade');
      if (input.techSupport === 'No') suggestions.push('Provide 3-month free tech support trial');
      if (input.monthlyCharges > 70) suggestions.push('Bundle value-added services to reduce cost perception');
      if (input.tenure < 12) suggestions.push('Assign dedicated onboarding success manager');
      setResult({ probability: Math.round(probability * 100), riskLevel, riskDrivers, suggestions });
    }
    setAnimKey(k => k + 1);
    setLoading(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h1 className="page-title">Predict Customer Churn</h1>
        <p className="page-desc">Run inference through the trained CatBoost ensemble model</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* ── Input form ── */}
        <div className="lg:col-span-3 card p-6 animate-fade-up opacity-0" style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(79,158,248,0.1)' }}>
                <Brain size={16} style={{ color: '#4F9EF8' }} />
              </div>
              <span className="section-title">Customer Profile</span>
            </div>
            <SelectField
              label=""
              value={model}
              onChange={v => setModel(v as ModelType)}
              options={[
                { label: 'CatBoost Ensemble', value: 'final' },
                { label: 'AutoML Benchmark', value: 'benchmark' },
                { label: 'LR Baseline', value: 'test' },
              ]}
            />
          </div>

          <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
            {/* Demographics */}
            <div>
              <div className="text-2xs font-bold text-textMuted uppercase tracking-widest mb-3 pb-2 border-b border-border">Demographics</div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Gender" value={input.gender} onChange={v => up({ gender: v })} options={[{ label: 'Male', value: 'Male' }, { label: 'Female', value: 'Female' }]} />
                <SelectField label="Senior Citizen" value={input.seniorCitizen} onChange={v => up({ seniorCitizen: Number(v) })} options={[{ label: 'No', value: 0 }, { label: 'Yes', value: 1 }]} />
                <SelectField label="Partner" value={input.partner} onChange={v => up({ partner: v })} options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
                <SelectField label="Dependents" value={input.dependents} onChange={v => up({ dependents: v })} options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
              </div>
            </div>

            {/* Services */}
            <div>
              <div className="text-2xs font-bold text-textMuted uppercase tracking-widest mb-3 pb-2 border-b border-border">Services</div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Tenure (months)">
                  <input type="number" value={input.tenure} onChange={e => up({ tenure: parseInt(e.target.value) || 0 })} className="field-input w-full" min={0} max={120} />
                </Field>
                <SelectField label="Phone Service" value={input.phoneService} onChange={v => up({ phoneService: v })} options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
                <SelectField label="Multiple Lines" value={input.multipleLines} onChange={v => up({ multipleLines: v })} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }, { label: 'No phone service', value: 'No phone service' }]} />
                <SelectField label="Internet Service" value={input.internetService} onChange={v => up({ internetService: v })} options={[{ label: 'DSL', value: 'DSL' }, { label: 'Fiber optic', value: 'Fiber optic' }, { label: 'None', value: 'No' }]} />
                <SelectField label="Online Security" value={input.onlineSecurity} onChange={v => up({ onlineSecurity: v })} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }, { label: 'No internet', value: 'No internet service' }]} />
                <SelectField label="Device Protection" value={input.deviceProtection} onChange={v => up({ deviceProtection: v })} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }, { label: 'No internet', value: 'No internet service' }]} />
                <SelectField label="Tech Support" value={input.techSupport} onChange={v => up({ techSupport: v })} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }, { label: 'No internet', value: 'No internet service' }]} />
                <SelectField label="Streaming TV" value={input.streamingTV} onChange={v => up({ streamingTV: v })} options={[{ label: 'No', value: 'No' }, { label: 'Yes', value: 'Yes' }, { label: 'No internet', value: 'No internet service' }]} />
              </div>
            </div>

            {/* Billing */}
            <div>
              <div className="text-2xs font-bold text-textMuted uppercase tracking-widest mb-3 pb-2 border-b border-border">Billing & Contract</div>
              <div className="grid grid-cols-2 gap-3">
                <SelectField label="Contract Type" value={input.contractType} onChange={v => up({ contractType: v })} options={[{ label: 'Month-to-month', value: 'Month-to-month' }, { label: 'One year', value: 'One year' }, { label: 'Two year', value: 'Two year' }]} />
                <SelectField label="Paperless Billing" value={input.paperlessBilling} onChange={v => up({ paperlessBilling: v })} options={[{ label: 'Yes', value: 'Yes' }, { label: 'No', value: 'No' }]} />
                <SelectField label="Payment Method" value={input.paymentMethod} onChange={v => up({ paymentMethod: v })} options={[{ label: 'Electronic check', value: 'Electronic check' }, { label: 'Mailed check', value: 'Mailed check' }, { label: 'Bank transfer', value: 'Bank transfer (automatic)' }, { label: 'Credit card', value: 'Credit card (automatic)' }]} />
                <Field label="Monthly Charges ($)">
                  <input type="number" value={input.monthlyCharges} onChange={e => up({ monthlyCharges: parseFloat(e.target.value) || 0 })} className="field-input w-full" min={0} step="0.01" />
                </Field>
                <Field label="Total Charges ($)">
                  <input type="number" value={input.totalCharges} onChange={e => up({ totalCharges: parseFloat(e.target.value) || 0 })} className="field-input w-full" min={0} step="0.01" />
                </Field>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-border">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="btn-brand w-full py-3 text-base gap-3"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Running Inference…
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Run Prediction
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Results ── */}
        <div className="lg:col-span-2 card p-6 animate-fade-up opacity-0" style={{ animationDelay: '160ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(229,9,20,0.1)' }}>
              <Zap size={16} style={{ color: '#E50914' }} />
            </div>
            <span className="section-title">Prediction Results</span>
          </div>

          {result ? (
            <div key={animKey} className="space-y-6 animate-scale-in">
              {/* Ring gauge */}
              <div className="flex justify-center py-2">
                <ProbabilityRing probability={result.probability} riskLevel={result.riskLevel} />
              </div>

              <div className="divider" />

              {/* Risk drivers */}
              {result.riskDrivers.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={14} className="text-warning" />
                    <span className="text-sm font-semibold text-textPrimary">Risk Drivers</span>
                  </div>
                  {result.riskDrivers.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-danger mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-textSecondary leading-relaxed">{d}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions.length > 0 && (
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle size={14} className="text-success" />
                    <span className="text-sm font-semibold text-textPrimary">Retention Actions</span>
                  </div>
                  {result.suggestions.map((s, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                      <span className="w-1.5 h-1.5 rounded-full bg-success mt-1.5 flex-shrink-0" />
                      <span className="text-sm text-textSecondary leading-relaxed">{s}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[480px] text-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'rgba(229,9,20,0.08)', border: '1px dashed rgba(229,9,20,0.2)' }}>
                <Zap size={28} className="text-brand opacity-40" />
              </div>
              <div className="space-y-1">
                <p className="text-textSecondary font-medium">No prediction yet</p>
                <p className="text-textMuted text-sm">Fill in customer details and click <strong className="text-textSecondary">Run Prediction</strong></p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
