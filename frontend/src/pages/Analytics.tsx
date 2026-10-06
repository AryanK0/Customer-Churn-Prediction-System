import { useEffect, useState } from 'react';
import { BarChart2, TrendingDown, DollarSign, Calendar, Award, Target } from 'lucide-react';

interface AnimatedBar {
  loaded: boolean;
}

function useAnimatedBars(): AnimatedBar {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);
  return { loaded };
}

function Bar({ pct, color, label, value, delay = 0, height = 6 }: {
  pct: number; color: string; label?: string; value?: string; delay?: number; height?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);

  return (
    <div className="space-y-1.5">
      {(label || value) && (
        <div className="flex justify-between text-sm">
          {label && <span className="text-textSecondary">{label}</span>}
          {value && <span className="font-semibold font-mono" style={{ color }}>{value}</span>}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className="progress-fill"
          style={{
            width: `${w}%`,
            background: color,
            transition: 'width 1s cubic-bezier(0.25, 1, 0.5, 1)',
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </div>
    </div>
  );
}

const models = [
  {
    name: 'CatBoost', tag: 'Primary Ensemble', accuracy: 95.39, rocAuc: 98.83, precision: 94.2, recall: 93.1, f1: 93.6,
    color: '#E50914', glow: 'rgba(229,9,20,0.2)',
  },
  {
    name: 'LightGBM', tag: 'AutoML Benchmark', accuracy: 94.1, rocAuc: 97.8, precision: 92.4, recall: 91.3, f1: 91.8,
    color: '#F59E0B', glow: 'rgba(245,158,11,0.15)',
  },
  {
    name: 'Logistic Regression', tag: 'Baseline', accuracy: 80.3, rocAuc: 84.5, precision: 78.2, recall: 72.5, f1: 75.2,
    color: '#6B7280', glow: 'rgba(107,114,128,0.1)',
  },
];

const featureImportance = [
  { feature: 'Contract Type', importance: 92, color: '#E50914' },
  { feature: 'Monthly Charges', importance: 78, color: '#F59E0B' },
  { feature: 'Tenure (months)', importance: 71, color: '#4F9EF8' },
  { feature: 'Tech Support', importance: 65, color: '#8B5CF6' },
  { feature: 'Payment Method', importance: 58, color: '#22C55E' },
  { feature: 'Internet Service', importance: 52, color: '#06B6D4' },
  { feature: 'Online Security', importance: 44, color: '#EC4899' },
  { feature: 'Streaming Services', importance: 38, color: '#F97316' },
];

const tenureData = [
  { range: '0–12 mo', churnRate: 55 }, { range: '13–24 mo', churnRate: 42 },
  { range: '25–36 mo', churnRate: 28 }, { range: '37–48 mo', churnRate: 18 },
  { range: '49–60 mo', churnRate: 12 }, { range: '60+ mo', churnRate: 8 },
];

const chargesData = [
  { range: '$0–30', churnRate: 15 }, { range: '$31–50', churnRate: 28 },
  { range: '$51–70', churnRate: 45 }, { range: '$71–90', churnRate: 62 }, { range: '$91+', churnRate: 75 },
];

const keyFindings = [
  { stat: '65%', label: 'Month-to-month Churn', sub: 'Highest risk contract type', color: '#EF4444', icon: TrendingDown },
  { stat: '55%', label: 'New Customer Risk', sub: 'Customers < 12 months tenure', color: '#F59E0B', icon: Calendar },
  { stat: '75%', label: 'High Charges Churn', sub: 'Monthly charges above $91', color: '#EF4444', icon: DollarSign },
  { stat: '8%', label: 'Loyal Customer Churn', sub: 'Customers > 60 months tenure', color: '#22C55E', icon: Award },
];

export default function Analytics() {
  const { loaded } = useAnimatedBars();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h1 className="page-title">Analytics &amp; Insights</h1>
        <p className="page-desc">Model performance, feature importance, and churn pattern analysis</p>
      </div>

      {/* ── Key findings KPI row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up opacity-0" style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}>
        {keyFindings.map((f, i) => (
          <div key={i} className="card p-5 lift">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: `${f.color}15` }}>
                <f.icon size={16} style={{ color: f.color }} strokeWidth={1.75} />
              </div>
            </div>
            <div className="text-3xl font-black font-mono" style={{ color: f.color }}>{f.stat}</div>
            <div className="text-sm font-semibold text-textPrimary mt-1">{f.label}</div>
            <div className="text-xs text-textMuted mt-0.5">{f.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Model tournament table ── */}
      <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(229,9,20,0.1)' }}>
              <Award size={16} style={{ color: '#E50914' }} />
            </div>
            <span className="section-title">Model Tournament</span>
          </div>
          <span className="badge badge-brand">16 Models Compared</span>
        </div>

        <div className="space-y-4">
          {models.map((m, i) => (
            <div
              key={m.name}
              className="rounded-xl p-4 transition-all duration-200 hover:scale-[1.005] animate-fade-up opacity-0"
              style={{
                background: `${m.glow}`,
                border: `1px solid ${m.color}25`,
                animationDelay: `${140 + i * 60}ms`,
                animationFillMode: 'forwards',
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                  <span className="font-semibold text-textPrimary">{m.name}</span>
                  {m.tag && (
                    <span className="badge" style={{ color: m.color, background: `${m.color}15`, border: `1px solid ${m.color}30` }}>
                      {m.tag}
                    </span>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  {[
                    { k: 'Accuracy', v: m.accuracy },
                    { k: 'ROC-AUC', v: m.rocAuc },
                    { k: 'F1', v: m.f1 },
                  ].map(stat => (
                    <div key={stat.k} className="text-center">
                      <div className="font-bold font-mono" style={{ color: m.color }}>{stat.v}%</div>
                      <div className="text-2xs text-textMuted uppercase tracking-wide">{stat.k}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Bar pct={m.accuracy} color={m.color} label="Accuracy" value={`${m.accuracy}%`} delay={loaded ? 0 : 300 + i * 60} />
                <Bar pct={m.rocAuc} color={m.color} label="ROC-AUC" value={`${m.rocAuc}%`} delay={loaded ? 0 : 350 + i * 60} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature importance + Tenure vs Churn ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(79,158,248,0.1)' }}>
              <Target size={16} style={{ color: '#4F9EF8' }} />
            </div>
            <span className="section-title">Feature Importance (SHAP)</span>
          </div>
          <div className="space-y-4">
            {featureImportance.map((f, i) => (
              <div key={f.feature}>
                <Bar
                  pct={f.importance}
                  color={f.color}
                  label={f.feature}
                  value={`${f.importance}%`}
                  delay={420 + i * 50}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          {/* Tenure vs churn */}
          <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '460ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Calendar size={16} style={{ color: '#F59E0B' }} />
              </div>
              <span className="section-title">Tenure vs Churn Rate</span>
            </div>
            <div className="space-y-3">
              {tenureData.map((d, i) => {
                const color = d.churnRate > 40 ? '#EF4444' : d.churnRate > 25 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={d.range} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-textMuted flex-shrink-0">{d.range}</span>
                    <div className="flex-1">
                      <Bar pct={d.churnRate} color={color} delay={480 + i * 40} />
                    </div>
                    <span className="w-10 text-right text-xs font-mono font-semibold" style={{ color }}>{d.churnRate}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly charges */}
          <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '520ms', animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.1)' }}>
                <DollarSign size={16} style={{ color: '#22C55E' }} />
              </div>
              <span className="section-title">Monthly Charges vs Churn</span>
            </div>
            <div className="space-y-3">
              {chargesData.map((d, i) => {
                const color = d.churnRate > 60 ? '#EF4444' : d.churnRate > 40 ? '#F59E0B' : '#22C55E';
                return (
                  <div key={d.range} className="flex items-center gap-3">
                    <span className="w-16 text-xs text-textMuted flex-shrink-0">{d.range}</span>
                    <div className="flex-1">
                      <Bar pct={d.churnRate} color={color} delay={540 + i * 40} />
                    </div>
                    <span className="w-10 text-right text-xs font-mono font-semibold" style={{ color }}>{d.churnRate}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Contract breakdown ── */}
      <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '580ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-lg" style={{ background: 'rgba(229,9,20,0.1)' }}>
            <BarChart2 size={16} style={{ color: '#E50914' }} />
          </div>
          <span className="section-title">Contract Type Breakdown</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { type: 'Month-to-month', customers: 3875, churnRate: 65, color: '#EF4444' },
            { type: 'One year', customers: 1473, churnRate: 35, color: '#F59E0B' },
            { type: 'Two year', customers: 1695, churnRate: 15, color: '#22C55E' },
          ].map((c, i) => (
            <div key={c.type} className="rounded-xl p-5 space-y-4" style={{ background: `${c.color}08`, border: `1px solid ${c.color}20` }}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-semibold text-textPrimary">{c.type}</div>
                  <div className="text-xs text-textMuted font-mono mt-0.5">{c.customers.toLocaleString()} customers</div>
                </div>
                <div className="text-3xl font-black font-mono" style={{ color: c.color }}>{c.churnRate}%</div>
              </div>
              <Bar pct={c.churnRate} color={c.color} delay={600 + i * 60} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
