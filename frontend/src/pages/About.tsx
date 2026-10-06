import { Database, Brain, Layers, Cpu, BarChart2, Users, Github, ExternalLink } from 'lucide-react';

const models = [
  { name: 'CatBoost', role: 'Primary Ensemble', metric: '98.83% ROC-AUC', color: '#E50914' },
  { name: 'XGBoost', role: 'Secondary Model', metric: '97.8% ROC-AUC', color: '#4F9EF8' },
  { name: 'Random Forest', role: 'Ensemble Member', metric: '96.1% ROC-AUC', color: '#22C55E' },
  { name: 'LightGBM', role: 'AutoML Benchmark', metric: '95.4% ROC-AUC', color: '#F59E0B' },
  { name: 'SVM', role: 'Classical Baseline', metric: '88.2% ROC-AUC', color: '#8B5CF6' },
  { name: 'Naïve Bayes', role: 'Probabilistic', metric: '79.1% ROC-AUC', color: '#EC4899' },
];

const techStack = [
  { icon: Brain, name: 'CatBoost / XGBoost', category: 'ML Models', color: '#E50914' },
  { icon: Database, name: 'scikit-learn Pipeline', category: 'Preprocessing', color: '#4F9EF8' },
  { icon: Layers, name: 'FastAPI + Uvicorn', category: 'Backend API', color: '#22C55E' },
  { icon: Cpu, name: 'React + Vite + TypeScript', category: 'Frontend', color: '#F59E0B' },
  { icon: BarChart2, name: 'SHAP Explainability', category: 'AI Interpretability', color: '#8B5CF6' },
  { icon: Users, name: 'Enterprise Datasets', category: 'Training Data', color: '#06B6D4' },
];

const metrics = [
  { label: 'ROC-AUC', value: '98.83%', color: '#E50914' },
  { label: 'Accuracy', value: '95.39%', color: '#4F9EF8' },
  { label: 'Precision', value: '94.2%', color: '#22C55E' },
  { label: 'Recall', value: '93.1%', color: '#F59E0B' },
  { label: 'F1 Score', value: '93.6%', color: '#8B5CF6' },
  { label: 'Training Records', value: '29,817', color: '#06B6D4' },
];

export default function About() {
  return (
    <div className="space-y-6 animate-fade-in w-full">
      {/* Header */}
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h1 className="page-title">About CCP</h1>
        <p className="page-desc">A production-grade ML platform for enterprise customer churn prediction</p>
      </div>

      {/* Hero card */}
      <div
        className="card p-8 animate-fade-up opacity-0 relative overflow-hidden"
        style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}
      >
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #E50914 0%, transparent 70%)' }} />
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 badge badge-brand mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
            Enterprise Edition
          </div>
          <h2 className="text-2xl font-bold text-textPrimary leading-tight">
            Advanced Predictive Analytics<br />
            <span className="text-textMuted font-normal text-lg">powered by gradient boosting models</span>
          </h2>
          <p className="text-textSecondary leading-relaxed text-sm max-w-2xl">
            CCP utilizes an ensemble of state-of-the-art machine learning models including CatBoost,
            XGBoost, and LightGBM to accurately predict customer churn. The architecture is designed
            for high-throughput inference, offering actionable insights and SHAP-based feature
            explainability via a scalable FastAPI microservice.
          </p>
          <div className="flex gap-3 pt-2">
            <button className="btn-brand gap-2"><ExternalLink size={14} /> API Docs</button>
            <button className="btn-ghost gap-2"><Github size={14} /> Source Code</button>
          </div>
        </div>
      </div>

      {/* Champion metrics */}
      <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}>
        <h2 className="section-title mb-4">Production Model Metrics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {metrics.map(m => (
            <div key={m.label} className="rounded-xl p-3 text-center" style={{ background: `${m.color}08`, border: `1px solid ${m.color}20` }}>
              <div className="text-xl font-black font-mono" style={{ color: m.color }}>{m.value}</div>
              <div className="text-2xs text-textMuted uppercase tracking-wide mt-1">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tournament models */}
        <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '180ms', animationFillMode: 'forwards' }}>
          <h2 className="section-title mb-4">Model Architecture</h2>
          <div className="space-y-3">
            {models.map((m, i) => (
              <div
                key={m.name}
                className="flex items-center gap-4 p-4 rounded-xl transition-all duration-150 hover:scale-[1.01]"
                style={{ background: `${m.color}06`, border: `1px solid ${m.color}20` }}
              >
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: m.color, boxShadow: `0 0 8px ${m.color}` }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-textPrimary text-sm">{m.name}</div>
                  <div className="text-xs text-textMuted">{m.role}</div>
                </div>
                <div className="text-xs font-mono font-semibold flex-shrink-0" style={{ color: m.color }}>{m.metric}</div>
                {i === 0 && <span className="badge badge-brand text-xs">Active</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '240ms', animationFillMode: 'forwards' }}>
          <h2 className="section-title mb-4">Technology Stack</h2>
          <div className="space-y-3">
            {techStack.map(t => (
              <div key={t.name} className="flex items-center gap-3 p-4 rounded-xl" style={{ background: `${t.color}07`, border: `1px solid ${t.color}18` }}>
                <div className="p-2 rounded-lg flex-shrink-0" style={{ background: `${t.color}15` }}>
                  <t.icon size={16} style={{ color: t.color }} strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-textPrimary">{t.name}</div>
                  <div className="text-xs text-textMuted">{t.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
