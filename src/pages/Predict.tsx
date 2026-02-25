import { useState } from 'react';
import { TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { apiPredict, type ModelType } from '../lib/api';

interface PredictionInput {
  gender: string;
  seniorCitizen: number;
  partner: string;
  dependents: string;
  tenure: number;
  phoneService: string;
  multipleLines: string;
  internetService: string;
  onlineSecurity: string;
  deviceProtection: string;
  techSupport: string;
  streamingTV: string;
  streamingMovies: string;
  contractType: string;
  paperlessBilling: string;
  paymentMethod: string;
  monthlyCharges: number;
  totalCharges: number;
}

interface PredictionResult {
  probability: number;
  riskLevel: string;
  riskDrivers: string[];
  suggestions: string[];
}

export default function Predict() {
  const [input, setInput] = useState<PredictionInput>({
    gender: 'Male',
    seniorCitizen: 0,
    partner: 'No',
    dependents: 'No',
    tenure: 12,
    phoneService: 'Yes',
    multipleLines: 'No',
    internetService: 'Fiber optic',
    onlineSecurity: 'No',
    deviceProtection: 'No',
    techSupport: 'No',
    streamingTV: 'No',
    streamingMovies: 'No',
    contractType: 'Month-to-month',
    paperlessBilling: 'Yes',
    paymentMethod: 'Electronic check',
    monthlyCharges: 70,
    totalCharges: 100,
  });

  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<ModelType>('final');

  const handlePredict = async () => {
    setLoading(true);
    try {
      const data = await apiPredict(input, model);
      await supabase.from('predictions').insert({
        gender: input.gender,
        senior_citizen: input.seniorCitizen,
        partner: input.partner,
        dependents: input.dependents,
        tenure: input.tenure,
        phone_service: input.phoneService,
        multiple_lines: input.multipleLines,
        internet_service: input.internetService,
        online_security: input.onlineSecurity,
        device_protection: input.deviceProtection,
        tech_support: input.techSupport,
        streaming_tv: input.streamingTV,
        streaming_movies: input.streamingMovies,
        contract_type: input.contractType,
        paperless_billing: input.paperlessBilling,
        payment_method: input.paymentMethod,
        monthly_charges: input.monthlyCharges,
        total_charges: input.totalCharges,
        churn_probability: data.probability / 100,
        risk_level: data.riskLevel,
      });
      setResult(data);
    } catch {
      // Fallback if API unreachable (e.g. local dev without backend)
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
      if (input.contractType === 'Month-to-month') riskDrivers.push('Month-to-month contract');
      if (input.monthlyCharges > 70) riskDrivers.push('High monthly charges');
      if (input.techSupport === 'No') riskDrivers.push('No tech support');
      if (input.tenure < 12) riskDrivers.push('Short tenure');
      const suggestions: string[] = [];
      if (input.contractType === 'Month-to-month') suggestions.push('Offer loyalty discount', 'Upgrade to annual plan');
      if (input.techSupport === 'No') suggestions.push('Provide priority support');
      if (input.monthlyCharges > 70) suggestions.push('Introduce value-added services');
      setResult({ probability: Math.round(probability * 100), riskLevel, riskDrivers, suggestions });
    }
    setLoading(false);
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'High':
        return 'text-[#E50914]';
      case 'Medium':
        return 'text-orange-400';
      default:
        return 'text-green-400';
    }
  };

  const getRiskBg = (level: string) => {
    switch (level) {
      case 'High':
        return 'bg-[#E50914]/20 border-[#E50914]';
      case 'Medium':
        return 'bg-orange-400/20 border-orange-400';
      default:
        return 'bg-green-400/20 border-green-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Predict Customer Churn</h1>
          <p className="text-[#B3B3B3]">Enter customer details to predict churn probability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#2a2a2a]">
            <h2 className="text-xl font-bold mb-6">Customer Information</h2>

            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Model (Notebook)</label>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value as ModelType)}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option value="final">Final (PyCaret LR)</option>
                  <option value="benchmark">Benchmark (H2O)</option>
                  <option value="test">Test (XGBoost/LGB/CatBoost)</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Gender</label>
                  <select value={input.gender} onChange={(e) => setInput({ ...input, gender: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Senior Citizen</label>
                  <select value={input.seniorCitizen} onChange={(e) => setInput({ ...input, seniorCitizen: Number(e.target.value) })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option value={0}>No</option>
                    <option value={1}>Yes</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Partner</label>
                  <select value={input.partner} onChange={(e) => setInput({ ...input, partner: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Dependents</label>
                  <select value={input.dependents} onChange={(e) => setInput({ ...input, dependents: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Tenure (months)</label>
                  <input type="number" value={input.tenure} onChange={(e) => setInput({ ...input, tenure: parseInt(e.target.value) || 0 })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50" min={0} />
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Phone Service</label>
                  <select value={input.phoneService} onChange={(e) => setInput({ ...input, phoneService: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Multiple Lines</label>
                <select value={input.multipleLines} onChange={(e) => setInput({ ...input, multipleLines: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                  <option>No</option>
                  <option>Yes</option>
                  <option>No phone service</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Internet Service</label>
                <select value={input.internetService} onChange={(e) => setInput({ ...input, internetService: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                  <option>DSL</option>
                  <option>Fiber optic</option>
                  <option>No</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Online Security</label>
                  <select value={input.onlineSecurity} onChange={(e) => setInput({ ...input, onlineSecurity: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>No</option>
                    <option>Yes</option>
                    <option>No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Device Protection</label>
                  <select value={input.deviceProtection} onChange={(e) => setInput({ ...input, deviceProtection: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>No</option>
                    <option>Yes</option>
                    <option>No internet service</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Tech Support</label>
                  <select value={input.techSupport} onChange={(e) => setInput({ ...input, techSupport: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>No</option>
                    <option>Yes</option>
                    <option>No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Streaming TV</label>
                  <select value={input.streamingTV} onChange={(e) => setInput({ ...input, streamingTV: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>No</option>
                    <option>Yes</option>
                    <option>No internet service</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Streaming Movies</label>
                  <select value={input.streamingMovies} onChange={(e) => setInput({ ...input, streamingMovies: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>No</option>
                    <option>Yes</option>
                    <option>No internet service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Contract</label>
                  <select value={input.contractType} onChange={(e) => setInput({ ...input, contractType: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Month-to-month</option>
                    <option>One year</option>
                    <option>Two year</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Paperless Billing</label>
                  <select value={input.paperlessBilling} onChange={(e) => setInput({ ...input, paperlessBilling: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Payment Method</label>
                  <select value={input.paymentMethod} onChange={(e) => setInput({ ...input, paymentMethod: e.target.value })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50">
                    <option>Electronic check</option>
                    <option>Mailed check</option>
                    <option>Bank transfer (automatic)</option>
                    <option>Credit card (automatic)</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Monthly Charges ($)</label>
                  <input type="number" value={input.monthlyCharges} onChange={(e) => setInput({ ...input, monthlyCharges: parseFloat(e.target.value) || 0 })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50" min={0} step="0.01" />
                </div>
                <div>
                  <label className="block text-sm text-[#B3B3B3] mb-2">Total Charges ($)</label>
                  <input type="number" value={input.totalCharges} onChange={(e) => setInput({ ...input, totalCharges: parseFloat(e.target.value) || 0 })} className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50" min={0} step="0.01" />
                </div>
              </div>

              <button
                onClick={handlePredict}
                disabled={loading}
                className="w-full bg-[#E50914] hover:bg-[#E50914]/90 text-white font-semibold py-3 rounded-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Predicting...' : 'Predict Churn'}
              </button>
            </div>
          </div>

          <div className="bg-[#1f1f1f] rounded-lg p-6 border border-[#2a2a2a]">
            <h2 className="text-xl font-bold mb-6">Prediction Results</h2>

            {result ? (
              <div className="space-y-6">
                <div className="text-center py-8 border-b border-[#2a2a2a]">
                  <div className="mb-4">
                    <TrendingDown className="w-16 h-16 mx-auto text-[#E50914]" />
                  </div>
                  <div className="text-5xl font-bold mb-2">{result.probability}%</div>
                  <div className="text-[#B3B3B3] mb-4">Churn Probability</div>
                  <div className={`inline-block px-6 py-2 rounded-full border ${getRiskBg(result.riskLevel)}`}>
                    <span className={`font-semibold ${getRiskColor(result.riskLevel)}`}>
                      {result.riskLevel} Risk
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="text-orange-400 w-5 h-5" />
                    <h3 className="font-semibold">Top Risk Drivers</h3>
                  </div>
                  <div className="space-y-2">
                    {result.riskDrivers.map((driver, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#B3B3B3]">
                        <XCircle className="w-4 h-4 text-[#E50914]" />
                        <span>{driver}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle className="text-green-400 w-5 h-5" />
                    <h3 className="font-semibold">Retention Strategies</h3>
                  </div>
                  <div className="space-y-2">
                    {result.suggestions.map((suggestion, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-[#B3B3B3]">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span>{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-[#B3B3B3]">
                <div className="text-center">
                  <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>Enter customer details and click predict to see results</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
