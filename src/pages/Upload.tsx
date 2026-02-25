import { useState } from 'react';
import { Upload as UploadIcon, FileText, CheckCircle, Download } from 'lucide-react';
import { apiUpload, type ModelType } from '../lib/api';

interface UploadResult {
  filename: string;
  totalRecords: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
}

export default function Upload() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploading, setUploading] = useState(false);
  const [model, setModel] = useState<ModelType>('final');

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }
    setUploading(true);
    try {
      const data = await apiUpload(file, model);
      setUploadResult({
        filename: data.filename ?? file.name,
        totalRecords: data.totalRecords ?? 0,
        highRiskCount: data.highRiskCount ?? 0,
        mediumRiskCount: data.mediumRiskCount ?? 0,
        lowRiskCount: data.lowRiskCount ?? 0,
      });
    } catch {
      setUploadResult({
        filename: file.name,
        totalRecords: 0,
        highRiskCount: 0,
        mediumRiskCount: 0,
        lowRiskCount: 0,
      });
    }
    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Upload CSV for Bulk Prediction</h1>
          <p className="text-[#B3B3B3]">Upload a CSV file containing customer data for batch churn prediction</p>
        </div>

        <div className="bg-[#1f1f1f] rounded-lg p-8 border border-[#2a2a2a]">
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-2">Model (Notebook)</h2>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value as ModelType)}
              className="w-full max-w-xs bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50 mb-4"
            >
              <option value="final">Final (PyCaret LR)</option>
              <option value="benchmark">Benchmark (H2O)</option>
              <option value="test">Test (XGBoost/LGB/CatBoost)</option>
            </select>
            <h2 className="text-xl font-bold mb-2">CSV Format Requirements</h2>
            <p className="text-sm text-[#B3B3B3] mb-4">Your CSV should contain the following columns:</p>
            <div className="bg-[#141414] rounded-lg p-4 text-sm font-mono text-[#B3B3B3] break-all">
              gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService, MultipleLines,
              InternetService, OnlineSecurity, DeviceProtection, TechSupport, StreamingTV, StreamingMovies,
              Contract, PaperlessBilling, PaymentMethod, MonthlyCharges, TotalCharges
            </div>
          </div>

          <form
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className="mb-6"
          >
            <label
              className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 ${
                dragActive
                  ? 'border-[#E50914] bg-[#E50914]/10'
                  : 'border-[#2a2a2a] hover:border-[#E50914]/50 hover:bg-[#E50914]/5'
              }`}
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <UploadIcon className={`w-12 h-12 mb-4 ${dragActive ? 'text-[#E50914]' : 'text-[#B3B3B3]'}`} />
                <p className="mb-2 text-sm text-[#B3B3B3]">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-[#B3B3B3]">CSV files only</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleChange}
                disabled={uploading}
              />
            </label>
          </form>

          {uploading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#E50914] mb-4"></div>
              <p className="text-[#B3B3B3]">Processing your file...</p>
            </div>
          )}

          {uploadResult && !uploading && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-green-400/10 border border-green-400 rounded-lg">
                <CheckCircle className="text-green-400 w-6 h-6" />
                <div>
                  <div className="font-semibold text-green-400">Upload Successful</div>
                  <div className="text-sm text-[#B3B3B3]">{uploadResult.filename}</div>
                </div>
              </div>

              <div className="bg-[#141414] rounded-lg p-6">
                <h3 className="text-lg font-bold mb-4">Prediction Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-1">{uploadResult.totalRecords}</div>
                    <div className="text-sm text-[#B3B3B3]">Total Records</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#E50914] mb-1">{uploadResult.highRiskCount}</div>
                    <div className="text-sm text-[#B3B3B3]">High Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-400 mb-1">{uploadResult.mediumRiskCount}</div>
                    <div className="text-sm text-[#B3B3B3]">Medium Risk</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-1">{uploadResult.lowRiskCount}</div>
                    <div className="text-sm text-[#B3B3B3]">Low Risk</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02]">
                  <Download className="w-5 h-5" />
                  Download Results
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-[#2a2a2a] hover:bg-[#2a2a2a]/80 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02]">
                  <FileText className="w-5 h-5" />
                  View Details
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#2a2a2a]">
          <h3 className="text-lg font-bold mb-4">Sample CSV Template</h3>
          <p className="text-sm text-[#B3B3B3] mb-4">Download our sample CSV template to get started</p>
          <button className="flex items-center gap-2 px-6 py-2 bg-[#2a2a2a] hover:bg-[#2a2a2a]/80 text-white rounded-lg transition-all duration-300">
            <Download className="w-4 h-4" />
            Download Template
          </button>
        </div>
      </div>
    </div>
  );
}
