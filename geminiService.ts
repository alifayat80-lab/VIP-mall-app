import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Schema for structured task breakdown
const taskResponseSchema = {
  type: Type.OBJECT,
  properties: {
    tasks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A concise title for the task" },
          description: { type: Type.STRING, description: "A brief description of what needs to be done" },
          priority: { type: Type.STRING, description: "High, Medium, or Low" }
        },
        required: ["title", "description", "priority"]
      }
    }
  }
};

export const organizeTasksWithAI = async (rawInput: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Break down the following user request into actionable, clear tasks. User Input: "${rawInput}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: taskResponseSchema,
        systemInstruction: "You are an expert project manager. Your goal is to convert vague or chaotic user thoughts into clear, actionable tasks."
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    
    const parsed = JSON.parse(jsonText);
    return parsed.tasks || [];
  } catch (error) {
    console.error("Failed to organize tasks:", error);
    throw error;
  }
};

export const generateSecurePasswordAdvice = async () => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: "Generate a witty, one-sentence tip about password security.",
        });
        return response.text;
    } catch (e) {
        return "Always use unique passwords for every site.";
    }
}