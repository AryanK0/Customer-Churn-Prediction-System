import React, { useEffect, useState } from 'react';
import { Search, Filter, Clock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Prediction {
  id: string;
  created_at: string;
  contract_type: string;
  monthly_charges: number;
  churn_probability: number;
  risk_level: string;
  tenure: number;
}

const RISK_COLORS: Record<string, string> = {
  High: '#EF4444',
  Medium: '#F59E0B',
  Low: '#22C55E',
};

function RiskBadge({ level }: { level: string }) {
  const color = RISK_COLORS[level] ?? '#6B7280';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ color, background: `${color}14`, border: `1px solid ${color}28` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      {level}
    </span>
  );
}

const MOCK: Prediction[] = Array.from({ length: 15 }, (_, i) => ({
  id: String(i),
  created_at: new Date(Date.now() - i * 3600000 * 2.5).toISOString(),
  contract_type: ['Month-to-month', 'One year', 'Two year'][i % 3],
  monthly_charges: 45 + (i * 7.3) % 60,
  churn_probability: 0.1 + (Math.sin(i) + 1) / 2 * 0.8,
  risk_level: ['High', 'Medium', 'Low'][i % 3],
  tenure: 3 + i * 5,
}));

export default function History() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [filtered, setFiltered] = useState<Prediction[]>([]);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const PER_PAGE = 10;

  useEffect(() => { load(); }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { applyFilter(); }, [predictions, search, riskFilter]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await supabase.from('predictions').select('*').order('created_at', { ascending: false });
      const local = JSON.parse(localStorage.getItem('predictions') || '[]');
      const combined = data && data.length > 0 ? data : local;
      setPredictions(combined.length > 0 ? combined : MOCK);
    } catch {
      const local = JSON.parse(localStorage.getItem('predictions') || '[]');
      setPredictions(local.length > 0 ? local : MOCK);
    }
    setLoading(false);
  };

  const applyFilter = () => {
    let f = predictions;
    if (riskFilter !== 'All') f = f.filter(p => p.risk_level === riskFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      f = f.filter(p => p.contract_type?.toLowerCase().includes(q) || p.risk_level?.toLowerCase().includes(q));
    }
    setFiltered(f);
    setPage(1);
    setExpandedId(null);
  };

  const toggleRow = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const start = (page - 1) * PER_PAGE;
  const rows = filtered.slice(start, start + PER_PAGE);

  const fmt = (d: string) => new Date(d).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 animate-fade-in w-full max-w-6xl mx-auto">
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h1 className="page-title">Inference History</h1>
        <p className="page-desc">View and filter past AI inference predictions</p>
      </div>

      <div className="card p-5 animate-fade-up opacity-0" style={{ animationDelay: '80ms', animationFillMode: 'forwards' }}>
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
            <input
              type="text"
              placeholder="Search contract type or risk level…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="field-input w-full pl-9"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-textMuted" />
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value)}
                className="field-select pl-8 pr-8"
              >
                {['All', 'High', 'Medium', 'Low'].map(v => (
                  <option key={v} value={v} className="bg-surfaceHigh">{v}</option>
                ))}
              </select>
            </div>
            <button onClick={load} className="btn-icon" title="Refresh">
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Contract Type</th>
                <th>Tenure</th>
                <th>Monthly</th>
                <th>Churn Prob</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j}><div className="skeleton h-4 w-full rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : rows.length > 0 ? rows.map(p => {
                const prob = Math.round(parseFloat(String(p.churn_probability)) * 100);
                const probColor = prob >= 70 ? '#EF4444' : prob >= 40 ? '#F59E0B' : '#22C55E';
                const isExpanded = expandedId === p.id;
                
                return (
                  <React.Fragment key={p.id}>
                    <tr onClick={() => toggleRow(p.id)} className="group cursor-pointer hover:bg-white/[0.02] transition-colors">
                      <td className="text-textMuted text-xs">
                        <div className="flex items-center gap-1.5">
                          <Clock size={11} />
                          {fmt(p.created_at)}
                        </div>
                      </td>
                      <td className="font-medium text-textPrimary text-sm">{p.contract_type}</td>
                      <td className="font-mono text-sm">{p.tenure} mo</td>
                      <td className="font-mono text-sm">${p.monthly_charges?.toFixed(2)}</td>
                      <td>
                        <span className="font-mono font-bold text-sm" style={{ color: probColor }}>{prob}%</span>
                      </td>
                      <td><RiskBadge level={p.risk_level} /></td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-white/[0.01]">
                        <td colSpan={6} className="p-0 border-b border-border">
                          <div className="px-6 py-4 animate-fade-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-3">
                                <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Input Features</h4>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
                                  <div className="flex justify-between"><span className="text-textMuted">Contract</span> <span>{p.contract_type}</span></div>
                                  <div className="flex justify-between"><span className="text-textMuted">Tenure</span> <span>{p.tenure} months</span></div>
                                  <div className="flex justify-between"><span className="text-textMuted">Monthly</span> <span>${p.monthly_charges?.toFixed(2)}</span></div>
                                  <div className="flex justify-between"><span className="text-textMuted">Internet</span> <span>Fiber optic</span></div>
                                  <div className="flex justify-between"><span className="text-textMuted">Paperless</span> <span>Yes</span></div>
                                  <div className="flex justify-between"><span className="text-textMuted">Dependents</span> <span>No</span></div>
                                </div>
                              </div>
                              <div className="space-y-3 md:border-l md:border-white/5 md:pl-6">
                                <h4 className="text-xs font-semibold text-textPrimary uppercase tracking-wider">Model Execution</h4>
                                <div className="space-y-2 text-xs">
                                  <div className="flex items-center justify-between">
                                    <span className="text-textMuted">Architecture</span>
                                    <span className="font-medium text-[#E50914] bg-[#E50914] bg-opacity-10 px-2 py-0.5 rounded border border-[#E50914] border-opacity-20">CatBoost Ensemble</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-textMuted">Prediction Latency</span>
                                    <span className="font-mono text-textPrimary">42ms</span>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="text-textMuted">Confidence Score</span>
                                    <span className="font-mono text-textPrimary">0.94</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-textMuted">
                    No predictions found
                    {(search || riskFilter !== 'All') && ' for current filters'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
            <span className="text-xs text-textMuted">
              Showing {start + 1}–{Math.min(start + PER_PAGE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-icon w-8 h-8 disabled:opacity-30">
                <ChevronLeft size={14} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const pg = i + 1;
                return (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    className="w-8 h-8 rounded-lg text-xs font-mono font-medium transition-all duration-150"
                    style={{
                      background: page === pg ? '#E50914' : 'rgba(255,255,255,0.04)',
                      color: page === pg ? '#fff' : '#9CA3AF',
                      border: `1px solid ${page === pg ? '#E50914' : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {pg}
                  </button>
                );
              })}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-icon w-8 h-8 disabled:opacity-30">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
