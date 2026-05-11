import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const generateMeetingSummary = async (transcript: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide a concise, professional executive summary and a list of key action items from the following meeting transcript:\n\n${transcript}`,
      config: {
        systemInstruction: "You are an elite secretary at a fortune 500 company. Your summaries are precise, professional, and highlight the most critical strategic points.",
      },
    });

    return response.text;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return "AI was unable to generate a summary at this time.";
  }
};

export const analyzeSpeakerSentiment = async (text: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the sentiment and collaboration quality of this discussion snippet: "${text}"`,
    });
    return response.text;
  } catch (error) {
    return null;
  }
};
