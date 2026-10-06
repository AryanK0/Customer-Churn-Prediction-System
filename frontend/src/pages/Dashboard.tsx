import { useEffect, useState, useRef } from 'react';
import { Users, TrendingDown, AlertTriangle, DollarSign, BarChart2, PieChart, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DashboardStats {
  totalCustomers: number;
  churnRate: number;
  highRiskCount: number;
  retentionOpportunity: number;
}

interface RiskDist {
  low: number;
  medium: number;
  high: number;
}

// Animated counter hook
function useCounter(target: number, duration = 1200, delay = 0) {
  const [value, setValue] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (target === 0) return;
    const timer = setTimeout(() => {
      started.current = true;
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, duration, delay]);
  return value;
}

function StatCard({ title, raw, suffix = '', icon: Icon, trend, color, delay = 0 }: {
  title: string; raw: number; suffix?: string;
  icon: React.ElementType; trend?: 'up' | 'down' | 'neutral';
  color: string; delay?: number;
}) {
  const value = useCounter(raw, 1200, delay);
  return (
    <div className="stat-card lift animate-fade-up opacity-0" style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}>
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg" style={{ background: `${color}15` }}>
          <Icon size={18} style={{ color }} strokeWidth={1.75} />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium" style={{
            color: trend === 'up' ? '#EF4444' : trend === 'down' ? '#22C55E' : '#6B7280'
          }}>
            {trend === 'up' ? <ArrowUpRight size={13} /> : trend === 'down' ? <ArrowDownRight size={13} /> : <Minus size={13} />}
            {trend === 'up' ? 'Risk' : trend === 'down' ? 'Safe' : 'Stable'}
          </span>
        )}
      </div>
      <div>
        <div className="text-2xl font-bold tracking-tight text-textPrimary font-mono">
          {value.toLocaleString()}{suffix}
        </div>
        <div className="text-xs text-textMuted mt-0.5 font-medium">{title}</div>
      </div>
    </div>
  );
}

function RiskBar({ label, value, color, delay = 0 }: { label: string; value: number; color: string; delay?: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(value), 300 + delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
          <span className="text-sm text-textSecondary">{label}</span>
        </div>
        <span className="text-sm font-semibold font-mono text-textPrimary">{value}%</span>
      </div>
      <div className="progress-track">
        <div
          className="progress-fill"
          style={{ width: `${width}%`, background: color, boxShadow: `0 0 8px ${color}50` }}
        />
      </div>
    </div>
  );
}

const insights = [
  { stat: '65%', label: 'Month-to-month contracts drive churn', sub: 'Highest risk segment — offer long-term loyalty incentives', trend: 'up' as const },
  { stat: '40%', label: 'Higher churn without tech support', sub: 'Proactive outreach reduces churn by up to 18%', trend: 'up' as const },
  { stat: '55%', label: 'New customers (<12mo) are high risk', sub: 'Critical onboarding window — invest in early engagement', trend: 'up' as const },
  { stat: '8%', label: 'Long-tenure churn rate (60+ months)', sub: 'Loyal customers — maintain relationship programmes', trend: 'down' as const },
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({ totalCustomers: 1250, churnRate: 26, highRiskCount: 325, retentionOpportunity: 26 });
  const [riskDist, setRiskDist] = useState<RiskDist>({ low: 35, medium: 40, high: 25 });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    loadStats();
    return () => clearTimeout(timer);
  }, []);

  const loadStats = async () => {
    const { data: predictions } = await supabase.from('predictions').select('*');
    if (predictions && predictions.length > 0) {
      const total = predictions.length;
      const highRisk = predictions.filter(p => p.risk_level === 'High').length;
      const medRisk = predictions.filter(p => p.risk_level === 'Medium').length;
      const lowRisk = predictions.filter(p => p.risk_level === 'Low').length;
      const avg = predictions.reduce((s, p) => s + parseFloat(p.churn_probability), 0) / total;
      setStats({ totalCustomers: total, churnRate: Math.round(avg * 100), highRiskCount: highRisk, retentionOpportunity: Math.round((highRisk / total) * 100) });
      setRiskDist({ low: Math.round((lowRisk / total) * 100), medium: Math.round((medRisk / total) * 100), high: Math.round((highRisk / total) * 100) });
    }
  };

  const statCards = [
    { title: 'Total Customers', raw: stats.totalCustomers, icon: Users, color: '#4F9EF8', trend: 'neutral' as const, delay: 0 },
    { title: 'Avg. Churn Risk', raw: stats.churnRate, suffix: '%', icon: TrendingDown, color: '#E50914', trend: 'up' as const, delay: 80 },
    { title: 'High Risk Accounts', raw: stats.highRiskCount, icon: AlertTriangle, color: '#F59E0B', trend: 'up' as const, delay: 160 },
    { title: 'Retention Opportunity', raw: stats.retentionOpportunity, suffix: '%', icon: DollarSign, color: '#22C55E', trend: 'down' as const, delay: 240 },
  ];

  const contractData = [
    { label: 'Month-to-month', pct: 65, color: '#E50914' },
    { label: 'One year', pct: 35, color: '#F59E0B' },
    { label: 'Two year', pct: 15, color: '#22C55E' },
  ];

  return (
    <div className={`space-y-6 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}>
      {/* ── Page header ── */}
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="page-header mb-0">
          <h1 className="page-title">Dashboard</h1>
          <p className="page-desc">Real-time overview of customer churn risk across your entire base</p>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(c => <StatCard key={c.title} {...c} />)}
      </div>

      {/* ── Mid row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Risk distribution */}
        <div className="card p-6 space-y-5 animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(79,158,248,0.1)' }}>
                <PieChart size={16} style={{ color: '#4F9EF8' }} strokeWidth={1.75} />
              </div>
              <span className="section-title">Risk Distribution</span>
            </div>
          </div>
          <div className="space-y-4 pt-1">
            <RiskBar label="Low Risk" value={riskDist.low} color="#22C55E" delay={300} />
            <RiskBar label="Medium Risk" value={riskDist.medium} color="#F59E0B" delay={400} />
            <RiskBar label="High Risk" value={riskDist.high} color="#E50914" delay={500} />
          </div>
          {/* Visual donut approximation */}
          <div className="flex gap-3 pt-2 border-t border-border">
            {[{ v: riskDist.low, c: '#22C55E', l: 'Low' }, { v: riskDist.medium, c: '#F59E0B', l: 'Med' }, { v: riskDist.high, c: '#E50914', l: 'High' }].map(d => (
              <div key={d.l} className="flex-1 text-center">
                <div className="text-lg font-bold font-mono" style={{ color: d.c }}>{d.v}%</div>
                <div className="text-2xs text-textMuted uppercase tracking-wide">{d.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Contract vs Churn */}
        <div className="card p-6 space-y-5 animate-fade-up opacity-0" style={{ animationDelay: '280ms', animationFillMode: 'forwards' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg" style={{ background: 'rgba(229,9,20,0.1)' }}>
              <BarChart2 size={16} style={{ color: '#E50914' }} strokeWidth={1.75} />
            </div>
            <span className="section-title">Contract vs Churn</span>
          </div>
          <div className="space-y-4">
            {contractData.map((row, i) => (
              <div key={row.label} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-textSecondary">{row.label}</span>
                  <span className="font-semibold font-mono" style={{ color: row.color }}>{row.pct}%</span>
                </div>
                <div className="progress-track">
                  <ContractBar pct={row.pct} color={row.color} delay={350 + i * 80} />
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-3 text-xs text-textMuted">
            Month-to-month customers are <span className="text-danger font-semibold">4.3×</span> more likely to churn than two-year contracts
          </div>
        </div>

        {/* Model badge */}
        <div className="card p-6 flex flex-col justify-between animate-fade-up opacity-0" style={{ animationDelay: '360ms', animationFillMode: 'forwards' }}>
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg" style={{ background: 'rgba(229,9,20,0.1)' }}>
                <TrendingDown size={16} style={{ color: '#E50914' }} strokeWidth={1.75} />
              </div>
              <span className="section-title">Active Model</span>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-textPrimary">CatBoost</div>
              <div className="text-xs text-textMuted">Gradient Boosted Trees · v1.0</div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'ROC-AUC', value: '98.83%' },
                { label: 'Accuracy', value: '95.39%' },
                { label: 'Precision', value: '94.2%' },
                { label: 'Recall', value: '93.1%' },
              ].map(m => (
                <div key={m.label} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="text-xs text-textMuted mb-1">{m.label}</div>
                  <div className="text-base font-bold font-mono" style={{ color: '#4F9EF8' }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-3 border-t border-border flex items-center gap-2 text-xs" style={{ color: '#22C55E' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Tournament winner · 16 models compared
          </div>
        </div>
      </div>

      {/* ── AI Insights ── */}
      <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '440ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="section-title">AI Insights</h2>
          <span className="badge badge-brand">CatBoost · SHAP</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {insights.map((insight, i) => (
            <div
              key={i}
              className="rounded-xl p-4 space-y-2 transition-all duration-200 cursor-default hover:scale-[1.02]"
              style={{
                background: insight.trend === 'up' ? 'rgba(239,68,68,0.05)' : 'rgba(34,197,94,0.05)',
                border: `1px solid ${insight.trend === 'up' ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)'}`,
              }}
            >
              <div className="text-3xl font-black font-mono" style={{ color: insight.trend === 'up' ? '#EF4444' : '#22C55E' }}>
                {insight.stat}
              </div>
              <div className="text-sm font-semibold text-textPrimary leading-tight">{insight.label}</div>
              <div className="text-xs text-textMuted leading-relaxed">{insight.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper to animate contract bars separately
function ContractBar({ pct, color, delay }: { pct: number; color: string; delay: number }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW(pct), delay);
    return () => clearTimeout(t);
  }, [pct, delay]);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}
