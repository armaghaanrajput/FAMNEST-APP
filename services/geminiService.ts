import { GoogleGenAI } from "@google/genai";

// Fixed: Strictly follow SDK initialization guidelines. 
// Always use new GoogleGenAI({apiKey: process.env.API_KEY}) right before usage.
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const chatWithAI = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const ai = getAI();
  
  // Use ai.models.generateContent for general text tasks with gemini-3-flash-preview.
  const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history.map(h => ({ role: h.role, parts: h.parts })), { role: 'user', parts: [{ text: message }] }],
      config: {
        systemInstruction: 'You are a safe, friendly, and helpful Family Assistant. Your goal is to help parents and children organize their lives, learn together, and manage family plans. Always be respectful and age-appropriate.',
      }
  });

  // Extract result using the .text property.
  return response.text;
};

export const generateFamilyImage = async (prompt: string, size: "1K" | "2K" | "4K" = "1K") => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: size
      }
    }
  });

  // Iterate through parts to find image data in nano banana series models.
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const animateImageWithVeo = async (base64Image: string, prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
  const ai = getAI();
  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: {
      imageBytes: base64Image.split(',')[1],
      mimeType: 'image/png',
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio
    }
  });

  // Long-running video operations require polling.
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 5000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) return null;

  // Append API key when fetching MP4 bytes from the download link.
  const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};
