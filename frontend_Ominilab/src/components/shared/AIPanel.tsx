import React, { useState } from 'react';
import { Sparkles, Brain, ThumbsUp, ThumbsDown, Send, RefreshCw, AlertCircle, CheckCircle2, Star, Award } from 'lucide-react';
import { API_CONFIG } from '../../config/api.config';

interface AIPanelProps {
  experimentId: string;
  actualStats: any | null; // Null if no actual data has been measured/recorded yet
}

interface AIQuestion {
  level: 'easy' | 'medium' | 'hard';
  text: string;
  answer: string;
  evaluation: {
    score: number;
    feedback: string;
    correct: string;
  } | null;
  evaluating: boolean;
}

const AI_URL = `${API_CONFIG.python.apiUrl}/api/ai/explain`;

export default function AIPanel({ experimentId, actualStats }: AIPanelProps) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AIQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<'actual' | 'demo'>(actualStats ? 'actual' : 'demo');
  const [ratedQuestions, setRatedQuestions] = useState<'up' | 'down' | null>(null);
  const [ratedEvaluation, setRatedEvaluation] = useState<'up' | 'down' | null>(null);

  // Get Demo Stats based on experiment ID
  const getDemoStats = () => {
    switch (experimentId) {
      case 'harmonic-motion-bmi160':
        return {
          dataSource: 'Synthetic Demo Replay',
          period: 1.245,
          frequency: 0.803,
          omega: 5.04,
          amplitude: 6.82,
          vmax: 34.37,
          amax: 1.732,
        };
      case 'specific-heat':
        return {
          dataSource: 'Calorimeter Demo Run',
          massWater: 0.100, // 100g
          avgPower: 15.42, // Watts
          slope: 0.0345, // Heating rate: C/s
          c_calc: 4469.0, // J/kg.K
        };
      case 'induction':
        return {
          dataSource: 'Electromagnetic Induction Demo Run',
          frequency: 2.50, // Magnet cycles/sec
          peakVoltage: 1.82, // Volts
          dt_transit: 0.082, // Transit duration through coil (s)
        };
      case 'capacitor':
        return {
          dataSource: 'Capacitor 1000uF Demo Run',
          capacitance: 1000e-6, // Farads
          tau: 4.72, // Time constant (s)
          maxVoltage: 3.55, // Volts
          storedEnergy: 6.30, // mJ
        };
      case 'lamp-va':
        return {
          dataSource: 'Filament Bulb (12V) Demo Run',
          resistance_1V: 10.45, // Ohms at 1V
          resistance_3V: 23.12, // Ohms at 3V
          maxCurrent: 0.185, // Amps
          alpha: 1.42, // Non-linearity coefficient (I ~ V^alpha)
        };
      case 'resistor-va':
        return {
          dataSource: 'Precision Resistor (100 Ohm) Demo Run',
          resistance: 100.25, // Ohms
          rSquared: 0.9998, // Linear coefficient of determination
        };
      default:
        return { dataSource: 'Default Demo Run' };
    }
  };

  const getStatsString = (stats: any) => {
    switch (experimentId) {
      case 'harmonic-motion-bmi160':
        return `T=${stats.period.toFixed(3)}s, f=${stats.frequency.toFixed(3)}Hz, ω=${stats.omega.toFixed(2)}rad/s, A=${stats.amplitude.toFixed(2)}cm, Vmax=${stats.vmax.toFixed(2)}cm/s, amax=${stats.amax.toFixed(3)}m/s²`;
      case 'specific-heat':
        return `Water Mass=${stats.massWater.toFixed(3)}kg, Average Power=${stats.avgPower.toFixed(2)}W, Temperature Rise Slope=${stats.slope.toFixed(5)}°C/s, Calculated Specific Heat c=${stats.c_calc.toFixed(0)}J/kg.K`;
      case 'induction':
        return `Cycle Frequency=${stats.frequency.toFixed(2)}Hz, Peak Induced Voltage=${stats.peakVoltage.toFixed(3)}V, Magnet Transit Time through Coil dt=${stats.dt_transit.toFixed(3)}s`;
      case 'capacitor':
        return `Nominal Capacitance=1000uF, Measured Time Constant Tau=${stats.tau.toFixed(2)}s, Max Charging Voltage=${stats.maxVoltage.toFixed(2)}V, Max Stored Energy=${stats.storedEnergy.toFixed(2)}mJ`;
      case 'lamp-va':
        return `Resistance at 1V=${stats.resistance_1V.toFixed(2)}Ω, Resistance at 3V=${stats.resistance_3V.toFixed(2)}Ω, Max Current=${(stats.maxCurrent * 1000).toFixed(0)}mA, Power Exponent Alpha=${stats.alpha.toFixed(2)}`;
      case 'resistor-va':
        return `Measured Resistance R=${stats.resistance.toFixed(2)}Ω, R² Linearity Fit=${stats.rSquared.toFixed(5)}`;
      default:
        return JSON.stringify(stats);
    }
  };

  const getExperimentTitle = () => {
    switch (experimentId) {
      case 'harmonic-motion-bmi160': return 'Harmonic Motion with BMI160';
      case 'specific-heat': return 'Specific Heat Capacity of Water';
      case 'induction': return 'Electromagnetic Induction';
      case 'capacitor': return 'Capacitor Charge & Discharge';
      case 'lamp-va': return 'Incandescent Lamp I-V Characteristic';
      case 'resistor-va': return 'Resistor I-V Characteristic';
      default: return 'Physics Lab Experiment';
    }
  };

  const getExperimentSystemPrompt = () => {
    const title = getExperimentTitle();
    return `You are a concise physics lab tutor for the experiment "${title}". Create exactly three questions grounded in the measured data, increasing in Bloom difficulty (easy/Recall, medium/Understand, hard/Apply). Return JSON only: {"questions":[{"level":"easy","text":"..."},{"level":"medium","text":"..."},{"level":"hard","text":"..."}]}`;
  };

  const getEvaluationSystemPrompt = (stats: any) => {
    const title = getExperimentTitle();
    const statsStr = getStatsString(stats);
    return `You are a physics lab tutor for "${title}". Data source: ${stats.dataSource}. Context: ${statsStr}. Evaluate the learner's answer against this data run. Return JSON only: {"score":0-10,"feedback":"...","correct":"..."}`;
  };

  const currentStats = activeTab === 'actual' && actualStats ? actualStats : getDemoStats();

  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiError(null);
    setQuestions([]);
    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt_token') || ''}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: getExperimentSystemPrompt() },
            { role: 'user', content: `Data source: ${currentStats.dataSource}. Results: ${getStatsString(currentStats)}` }
          ],
          max_tokens: 600
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const parsed = JSON.parse(rawContent);

      const qs = (parsed.questions || []).map((q: any) => ({
        level: q.level || 'medium',
        text: q.text || '',
        answer: '',
        evaluation: null,
        evaluating: false
      }));

      if (qs.length === 0) throw new Error('No questions returned in AI response.');
      setQuestions(qs);
      setRatedQuestions(null);
      setRatedEvaluation(null);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI request failed — please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleEvaluate = async (idx: number) => {
    const q = questions[idx];
    if (!q.answer.trim()) return;

    setQuestions(prev => prev.map((x, i) => i === idx ? { ...x, evaluating: true } : x));
    setAiError(null);

    try {
      const response = await fetch(AI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('jwt_token') || ''}`
        },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: getEvaluationSystemPrompt(currentStats) },
            { role: 'user', content: `Question: ${q.text}\nLearner answer: ${q.answer}` }
          ],
          max_tokens: 300
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server error ${response.status}`);
      }

      const data = await response.json();
      const rawContent = data.choices?.[0]?.message?.content || '{}';
      const ev = JSON.parse(rawContent);

      setQuestions(prev => prev.map((x, i) => i === idx ? { ...x, evaluation: ev, evaluating: false } : x));
    } catch (err) {
      setAiError(err instanceof Error ? err.message : 'AI evaluation failed — please try again.');
      setQuestions(prev => prev.map((x, i) => i === idx ? { ...x, evaluating: false } : x));
    }
  };

  return (
    <section className="max-w-7xl mx-auto w-full bg-slate-950/95 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.15)] rounded-3xl p-8 text-white relative overflow-hidden backdrop-blur-md">
      {/* Decorative Glowing Aura */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="text-purple-400 animate-pulse" size={24} />
            <h2 className="text-xl font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400">
              Ominilab AI Lab Tutor
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Grounded AI reasoning based on live experimental data & parameters
          </p>
        </div>

        {/* Data Source Selector */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => { setActiveTab('actual'); setQuestions([]); }}
            disabled={!actualStats}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'actual' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:hover:text-slate-400'}`}
          >
            Actual Run Data {!actualStats && '🔒'}
          </button>
          <button
            onClick={() => { setActiveTab('demo'); setQuestions([]); }}
            className={`px-4 py-2 rounded-lg transition-all ${activeTab === 'demo' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Demo Simulation Run
          </button>
        </div>
      </div>

      {/* Current Data Summary Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Current Telemetry Context</div>
          <div className="text-sm font-semibold text-slate-200 font-mono mt-1">
            {getStatsString(currentStats)}
          </div>
        </div>
        <button
          onClick={handleGenerateAI}
          disabled={aiLoading}
          className="flex-shrink-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-40 text-white font-black uppercase text-xs rounded-xl transition-all active:scale-95 flex items-center gap-2 shadow-[0_4px_15px_rgba(147,51,234,0.3)]"
        >
          {aiLoading ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
          {aiLoading ? 'Analyzing...' : 'Generate AI Questions'}
        </button>
      </div>

      {/* Errors & Instructions */}
      {aiError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold rounded-2xl mb-6 flex items-center gap-3">
          <AlertCircle size={16} className="flex-shrink-0" />
          <span>{aiError}</span>
        </div>
      )}

      {questions.length === 0 && !aiLoading && (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl bg-slate-900/20">
          <Brain size={48} className="text-slate-700 mx-auto mb-3" />
          <h4 className="text-sm font-bold text-slate-300">No active AI lesson session</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            {activeTab === 'actual' 
              ? 'Perform the experiment and record enough data points to run the AI analyzer.' 
              : 'Click the "Generate AI Questions" button to start a demo session based on synthetic data.'}
          </p>
        </div>
      )}

      {/* Questions List */}
      <div className="space-y-6">
        {questions.map((q, i) => {
          const levelColor = 
            q.level === 'easy' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : q.level === 'medium' 
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
          const levelLabel = q.level === 'easy' ? 'Level 1: Recall' : q.level === 'medium' ? 'Level 2: Understand' : 'Level 3: Apply';

          return (
            <div key={i} className="border border-slate-800 bg-slate-900/40 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${levelColor}`}>
                  {levelLabel}
                </span>
                <p className="text-sm text-slate-200 font-medium leading-relaxed">
                  {q.text}
                </p>
              </div>

              {/* User Answer Area */}
              <div className="flex gap-2">
                <input
                  value={q.answer}
                  onChange={e => setQuestions(prev => prev.map((x, j) => j === i ? { ...x, answer: e.target.value } : x))}
                  placeholder="Type your physical explanation or calculated answer..."
                  disabled={q.evaluating}
                  className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all placeholder-slate-600"
                />
                <button
                  onClick={() => handleEvaluate(i)}
                  disabled={!q.answer.trim() || q.evaluating}
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-black uppercase text-xs rounded-xl transition-all active:scale-95 flex items-center gap-1.5 shadow-md"
                >
                  {q.evaluating ? <RefreshCw size={12} className="animate-spin" /> : <Send size={12} />}
                  Evaluate
                </button>
              </div>

              {/* Evaluation Response Card */}
              {q.evaluation && (
                <div className={`rounded-xl p-4 border transition-all ${q.evaluation.score >= 7 ? 'bg-emerald-950/30 border-emerald-500/20 text-emerald-200' : 'bg-rose-950/30 border-rose-500/20 text-rose-200'}`}>
                  <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider mb-2">
                    <Award size={16} className={q.evaluation.score >= 7 ? 'text-emerald-400' : 'text-rose-400'} />
                    Score: {q.evaluation.score}/10
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    {q.evaluation.feedback}
                  </p>
                  {q.evaluation.score < 8 && (
                    <div className="border-t border-slate-800 pt-3 mt-2">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Suggested Reference Explanation</div>
                      <p className="text-xs text-slate-200 font-medium italic mt-1">
                        {q.evaluation.correct}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Ratings Panel (Visible only when questions are generated) */}
      {questions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-800 pt-6 mt-8">
          {/* Rate AI Questions */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-semibold">Rate quality of AI questions:</span>
            {ratedQuestions ? (
              <span className="text-xs text-purple-400 font-bold animate-pulse">Thank you for rating!</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRatedQuestions('up')}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-green-400 hover:border-green-500/25 transition-all"
                  aria-label="Thumbs up questions"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => setRatedQuestions('down')}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-500/25 transition-all"
                  aria-label="Thumbs down questions"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Rate AI Evaluations */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 font-semibold">Rate AI evaluation accuracy:</span>
            {ratedEvaluation ? (
              <span className="text-xs text-purple-400 font-bold animate-pulse">Thank you for rating!</span>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setRatedEvaluation('up')}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-green-400 hover:border-green-500/25 transition-all"
                  aria-label="Thumbs up evaluation"
                >
                  <ThumbsUp size={14} />
                </button>
                <button
                  onClick={() => setRatedEvaluation('down')}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-rose-400 hover:border-rose-500/25 transition-all"
                  aria-label="Thumbs down evaluation"
                >
                  <ThumbsDown size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
