import React, { useState } from 'react';
import { TraineeSchedule, GeminiAnalysisResult } from '../types';
import { analyzeSchedule } from '../services/geminiService';
import { Sparkles, Brain, Info, AlertCircle } from 'lucide-react';

interface GeminiAnalysisProps {
  schedule: TraineeSchedule;
}

export const GeminiAnalysis: React.FC<GeminiAnalysisProps> = ({ schedule }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeSchedule(schedule);
      setAnalysis(result);
    } catch (err) {
      setError("حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="bg-purple-500 p-2 rounded-lg">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold">المساعد الذكي للجدول</h3>
            <p className="text-gray-400 text-xs">مدعوم بواسطة Google Gemini 2.5</p>
          </div>
        </div>
        
        {!analysis && !loading && (
          <button
            onClick={handleAnalysis}
            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-medium transition-all shadow-lg hover:shadow-purple-500/30 flex items-center gap-2"
          >
            <Brain size={18} />
            تحليل جدولي
          </button>
        )}
      </div>

      {loading && (
        <div className="py-8 text-center space-y-3 animate-pulse">
          <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-purple-300">جاري قراءة وتحليل جدولك الدراسي...</p>
        </div>
      )}

      {analysis && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Summary Card */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h4 className="text-purple-300 font-bold mb-2 flex items-center gap-2">
                <Info size={16} />
                ملخص الجدول
              </h4>
              <p className="text-sm leading-relaxed">{analysis.summary}</p>
            </div>

            {/* Hardest Day Card */}
            <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h4 className="text-red-300 font-bold mb-2 flex items-center gap-2">
                <AlertCircle size={16} />
                أكثر الأيام ضغطاً
              </h4>
              <p className="text-xl font-bold text-center mt-2">{analysis.hardestDay}</p>
            </div>

             {/* Tips Card */}
             <div className="bg-gray-700/50 p-4 rounded-lg border border-gray-600">
              <h4 className="text-green-300 font-bold mb-2 flex items-center gap-2">
                <Sparkles size={16} />
                نصائح لك
              </h4>
              <ul className="text-sm space-y-2 list-disc list-inside text-gray-300">
                {analysis.tips.map((tip, idx) => (
                  <li key={idx}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="text-center mt-4">
            <button 
              onClick={() => setAnalysis(null)}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              إخفاء التحليل
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/20 text-red-200 p-4 rounded-lg mt-4 text-center">
          {error}
        </div>
      )}
    </div>
  );
};