import { GoogleGenAI } from "@google/genai";
import { TraineeSchedule, GeminiAnalysisResult } from "../types";

// Initialize Gemini Client
// Note: In a production environment, ensure API_KEY is secure.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeSchedule = async (schedule: TraineeSchedule): Promise<GeminiAnalysisResult> => {
  try {
    const modelId = "gemini-2.5-flash";
    const prompt = `
      أنت مساعد أكاديمي ذكي للكلية التقنية بالطائف.
      لديك جدول المتدرب التالي بصيغة JSON:
      ${JSON.stringify(schedule)}

      المطلوب منك تحليل هذا الجدول وتقديم تقرير مختصر جداً باللغة العربية يحتوي على:
      1. ملخص عام لضغط الجدول (سهل، متوسط، صعب).
      2. نصائح للمتدرب (مثلاً: لديك يوم طويل يوم الخميس، انتبه للفطور).
      3. تحديد أصعب يوم دراسي.
      
      الرد يجب أن يكون بنسق JSON فقط كالتالي ولا تضيف اي تنسيق markdown:
      {
        "summary": "...",
        "tips": ["...", "..."],
        "hardestDay": "..."
      }
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as GeminiAnalysisResult;

  } catch (error) {
    console.error("Error analyzing schedule:", error);
    // Fallback if AI fails or no key
    return {
      summary: "لم نتمكن من تحليل الجدول حالياً (تأكد من مفتاح API).",
      tips: ["حاول تنظيم وقتك جيداً.", "راجع المرشد الأكاديمي عند الحاجة."],
      hardestDay: "غير محدد"
    };
  }
};