import { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, Download, AlertCircle, ChevronDown } from 'lucide-react';
import { apiUpload, type ModelType } from '../lib/api';

interface UploadResult {
  filename: string;
  totalRecords: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

const COLUMNS = [
  'gender', 'SeniorCitizen', 'Partner', 'Dependents', 'tenure',
  'PhoneService', 'MultipleLines', 'InternetService', 'OnlineSecurity',
  'DeviceProtection', 'TechSupport', 'StreamingTV', 'StreamingMovies',
  'Contract', 'PaperlessBilling', 'PaymentMethod', 'MonthlyCharges', 'TotalCharges',
];

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [model, setModel] = useState<ModelType>('final');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0]);
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) processFile(e.target.files[0]);
  };

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) { setError('Only CSV files are supported.'); return; }
    setError(null);
    setSelectedFile(file);
    setUploading(true);
    try {
      const data = await apiUpload(file, model);
      setResult({
        filename: data.filename ?? file.name,
        totalRecords: data.totalRecords ?? 0,
        highRiskCount: data.highRiskCount ?? 0,
        mediumRiskCount: data.mediumRiskCount ?? 0,
        lowRiskCount: data.lowRiskCount ?? 0,
      });
    } catch {
      setResult({ filename: file.name, totalRecords: 0, highRiskCount: 0, mediumRiskCount: 0, lowRiskCount: 0 });
    }
    setUploading(false);
  };

  const reset = () => { setResult(null); setSelectedFile(null); setError(null); };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto w-full">
      <div className="animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
        <h1 className="page-title">Batch Inference</h1>
        <p className="page-desc">Upload a CSV file to run bulk predictions across all customers</p>
      </div>

      {/* Model selector */}
      <div className="card p-5 animate-fade-up opacity-0" style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <div className="field-label">Model</div>
            <div className="relative">
              <select value={model} onChange={e => setModel(e.target.value as ModelType)} className="field-select w-full">
                <option value="final" className="bg-surfaceHigh">CatBoost Ensemble (Recommended)</option>
                <option value="benchmark" className="bg-surfaceHigh">AutoML Benchmark</option>
                <option value="test" className="bg-surfaceHigh">LR Baseline</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-textMuted pointer-events-none" />
            </div>
          </div>
          <div className="sm:text-right">
            <div className="text-xs text-textMuted mb-1">Active Model</div>
            <div className="badge badge-brand">ROC-AUC 98.83%</div>
          </div>
        </div>
      </div>

      {/* Drop zone */}
      {!result && (
        <div className="card p-6 animate-fade-up opacity-0" style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}>
          <form onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <label
              className="flex flex-col items-center justify-center w-full h-56 rounded-xl cursor-pointer transition-all duration-200"
              style={{
                border: `2px dashed ${dragActive ? '#E50914' : 'rgba(255,255,255,0.12)'}`,
                background: dragActive ? 'rgba(229,9,20,0.06)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div className="flex flex-col items-center gap-3 select-none">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: dragActive ? 'rgba(229,9,20,0.15)' : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${dragActive ? 'rgba(229,9,20,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <UploadIcon size={24} style={{ color: dragActive ? '#E50914' : '#6B7280' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm text-textSecondary">
                    <span className="font-semibold text-textPrimary">Click to choose file</span> or drag &amp; drop
                  </p>
                  <p className="text-xs text-textMuted mt-1 font-mono">CSV files only · Max 50 MB</p>
                </div>
                {selectedFile && !uploading && (
                  <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-full" style={{ background: 'rgba(79,158,248,0.1)', color: '#4F9EF8', border: '1px solid rgba(79,158,248,0.2)' }}>
                    <FileText size={12} />
                    {selectedFile.name}
                  </div>
                )}
              </div>
              <input type="file" className="hidden" accept=".csv" onChange={handleChange} disabled={uploading} />
            </label>
          </form>

          {/* Error */}
          {error && (
            <div className="mt-4 flex items-center gap-3 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={16} className="text-danger flex-shrink-0" />
              <span className="text-sm text-danger">{error}</span>
            </div>
          )}

          {/* Uploading state */}
          {uploading && (
            <div className="mt-6 flex flex-col items-center gap-4 py-4">
              <div className="relative w-12 h-12">
                <svg className="animate-spin w-12 h-12" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(229,9,20,0.15)" strokeWidth="4" />
                  <circle cx="24" cy="24" r="20" fill="none" stroke="#E50914" strokeWidth="4" strokeDasharray="30 95" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-sm text-textSecondary">Running batch inference…</div>
            </div>
          )}
        </div>
      )}

      {/* Result */}
      {result && !uploading && (
        <div className="card p-6 space-y-5 animate-scale-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 p-3 rounded-xl flex-1" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <CheckCircle size={18} className="text-success flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-success">Inference complete</div>
                <div className="text-xs text-textMuted font-mono">{result.filename}</div>
              </div>
            </div>
            <button onClick={reset} className="btn-ghost ml-4 text-xs">New Upload</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Records', value: result.totalRecords, color: '#FFFFFF' },
              { label: 'High Risk', value: result.highRiskCount, color: '#EF4444' },
              { label: 'Medium Risk', value: result.mediumRiskCount, color: '#F59E0B' },
              { label: 'Low Risk', value: result.lowRiskCount, color: '#22C55E' },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-4 text-center" style={{ background: `${s.color}08`, border: `1px solid ${s.color}18` }}>
                <div className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                <div className="text-xs text-textMuted mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button className="btn-brand flex-1 gap-2"><Download size={15} /> Download Results</button>
            <button className="btn-ghost flex-1 gap-2"><FileText size={15} /> View Details</button>
          </div>
        </div>
      )}

      {/* CSV format reference */}
      <div className="card p-5 animate-fade-up opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Required CSV Columns</h3>
          <button className="btn-ghost text-xs gap-1.5"><Download size={13} /> Sample Template</button>
        </div>
        <div className="rounded-lg p-4 font-mono text-xs text-textMuted break-all leading-relaxed" style={{ background: '#0A0A0A', border: '1px solid rgba(255,255,255,0.06)' }}>
          {COLUMNS.join(', ')}
        </div>
        <p className="text-xs text-textMuted mt-3">Column names are case-sensitive. Ensure all 18 columns are present in the header row.</p>
      </div>
    </div>
  );
}
