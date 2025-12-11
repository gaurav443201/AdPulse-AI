import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Brand, Platform } from "../types";
import { BRAND_GUIDELINES, PLATFORM_RULES } from "../constants";

// Initialize Gemini Client
// The API key must be obtained exclusively from the environment variable process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Parses a natural language user request into a structured Campaign object.
 */
export const parseCampaignRequest = async (userInput: string, existingContext: any = {}) => {
  if (!process.env.API_KEY) {
    return {
      conversationalResponse: "API Key is missing. Please check your deployment settings.",
      missingInfo: []
    };
  }

  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      advertiser: { type: Type.STRING, enum: Object.values(Brand) },
      name: { type: Type.STRING },
      budget: { type: Type.NUMBER },
      startDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
      endDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
      platforms: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING, enum: Object.values(Platform) } 
      },
      objective: { type: Type.STRING },
      targetAudience: { type: Type.STRING },
      missingInfo: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of fields required for a campaign that are missing from the request"
      },
      conversationalResponse: {
        type: Type.STRING,
        description: "A natural language response to the user confirming what was understood and asking for missing info."
      }
    },
    required: ["conversationalResponse", "missingInfo"]
  };

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        You are an expert Retail Media AI Assistant.
        Current Context: ${JSON.stringify(existingContext)}
        User Input: "${userInput}"
        
        Extract campaign details. If details are missing, list them in 'missingInfo'. 
        Today's date is 2024-05-20.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are a helpful assistant for a Retail Media Ad Platform. Your goal is to help users configure ad campaigns for brands like Nike, Coca-Cola, and Samsung."
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    return {
      conversationalResponse: "I'm having trouble connecting to the AI brain right now. Please try again.",
      missingInfo: []
    };
  }
};

/**
 * Generates creative assets (copy) for specific platforms based on campaign data.
 */
export const generateCreativeCopy = async (
  advertiser: Brand,
  platform: Platform,
  productName: string,
  audience: string,
  objective: string
) => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      headline: { type: Type.STRING },
      description: { type: Type.STRING },
      cta: { type: Type.STRING },
      reasoning: { type: Type.STRING, description: "Why this copy works for this platform and audience" }
    }
  };

  const brandRules = BRAND_GUIDELINES[advertiser] || "Standard professional tone.";
  const platformRules = PLATFORM_RULES[platform] || "Standard ad compliance.";

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        Generate ad copy for:
        Brand: ${advertiser}
        Product: ${productName}
        Platform: ${platform}
        Audience: ${audience}
        Objective: ${objective}
        
        Brand Guidelines: ${brandRules}
        Platform Rules: ${platformRules}
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.7 // Slightly creative
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Creative Gen Error:", error);
    throw new Error("Failed to generate creative.");
  }
};

/**
 * Validates creative content against platform compliance rules.
 */
export const validateCompliance = async (
  platform: Platform,
  headline: string,
  description: string,
  advertiser: Brand
) => {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.NUMBER, description: "0 to 100 compliance score" },
      issues: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: "List of specific policy violations or warnings" 
      },
      isCompliant: { type: Type.BOOLEAN }
    }
  };

  const platformRules = PLATFORM_RULES[platform];

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        Analyze this creative for compliance.
        Platform: ${platform}
        Rules: ${platformRules}
        
        Creative Content:
        Headline: "${headline}"
        Description: "${description}"
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Compliance Error:", error);
    return { score: 0, issues: ["AI Validation Failed"], isCompliant: false };
  }
};