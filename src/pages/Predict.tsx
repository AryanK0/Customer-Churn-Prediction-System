import { useState } from 'react';
import { TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { apiPredict, type ModelType } from '../lib/api';

interface PredictionInput {
  gender: string;
  contractType: string;
  internetService: string;
  techSupport: string;
  paymentMethod: string;
  tenure: number;
  monthlyCharges: number;
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
    contractType: 'Month-to-month',
    internetService: 'Fiber optic',
    techSupport: 'No',
    paymentMethod: 'Electronic check',
    tenure: 12,
    monthlyCharges: 70,
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
        contract_type: input.contractType,
        internet_service: input.internetService,
        tech_support: input.techSupport,
        payment_method: input.paymentMethod,
        tenure: input.tenure,
        monthly_charges: input.monthlyCharges,
        churn_probability: data.probability / 100,
        risk_level: data.riskLevel,
      });
      setResult(data);
    } catch {
      // Fallback to client-side logic if API unreachable (e.g. local dev without backend)
      let probability = 0.3;
      if (input.contractType === 'Month-to-month') probability += 0.25;
      if (input.monthlyCharges > 70) probability += 0.15;
      if (input.techSupport === 'No') probability += 0.15;
      if (input.tenure < 12) probability += 0.15;
      if (input.paymentMethod === 'Electronic check') probability += 0.10;
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

            <div className="space-y-4">
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
              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Gender</label>
                <select
                  value={input.gender}
                  onChange={(e) => setInput({ ...input, gender: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option>Male</option>
                  <option>Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Contract Type</label>
                <select
                  value={input.contractType}
                  onChange={(e) => setInput({ ...input, contractType: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option>Month-to-month</option>
                  <option>One year</option>
                  <option>Two year</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Internet Service</label>
                <select
                  value={input.internetService}
                  onChange={(e) => setInput({ ...input, internetService: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option>DSL</option>
                  <option>Fiber optic</option>
                  <option>No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Tech Support</label>
                <select
                  value={input.techSupport}
                  onChange={(e) => setInput({ ...input, techSupport: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Payment Method</label>
                <select
                  value={input.paymentMethod}
                  onChange={(e) => setInput({ ...input, paymentMethod: e.target.value })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                >
                  <option>Electronic check</option>
                  <option>Mailed check</option>
                  <option>Bank transfer</option>
                  <option>Credit card</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Tenure (months)</label>
                <input
                  type="number"
                  value={input.tenure}
                  onChange={(e) => setInput({ ...input, tenure: parseInt(e.target.value) })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm text-[#B3B3B3] mb-2">Monthly Charges ($)</label>
                <input
                  type="number"
                  value={input.monthlyCharges}
                  onChange={(e) => setInput({ ...input, monthlyCharges: parseFloat(e.target.value) })}
                  className="w-full bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#E50914]/50"
                  min="0"
                  step="0.01"
                />
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
