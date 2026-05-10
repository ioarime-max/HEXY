/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, BusinessProfile, Transaction, InventoryItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateBusinessAdvice(
  prompt: string,
  profile: BusinessProfile,
  recentTransactions: Transaction[],
  inventory?: InventoryItem[]
): Promise<string> {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `
    You are HoneyBee's AI Business Advisor, a practical SME consultant.
    The user's business: ${profile.name} (${profile.industry}, ${profile.type}).
    Goals: ${profile.goals.join(", ")}.
    Recent transactions: ${JSON.stringify(recentTransactions.slice(0, 10))}.
    Inventory status: ${inventory ? JSON.stringify(inventory.slice(0, 10)) : 'Not available'}.
    Provide actionable, SME-specific advice. Structure your response into:
    - Summary
    - Problem Analysis
    - Recommendations
    - Risk Level
    - Suggested Tasks
    
    Be practical, not corporate. Use simple language.
    Note: Always use RM (Malaysian Ringgit) for all currency mentions.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
    },
  });

  return response.text || "I'm sorry, I couldn't generate advice at this moment.";
}

export async function generateMarketingContent(
  productName: string,
  keywords: string,
  profile: BusinessProfile,
  type: string,
  goal: string,
  audience: string,
  tone: string
): Promise<string> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an expert Malaysian SME Marketing Consultant.
    The business is: ${profile.name} (${profile.industry}).
    
    TASK: Generate a high-converting ${type}
    PRODUCT/SUBJECT: ${productName}
    GOAL: ${goal}
    TARGET AUDIENCE: ${audience}
    TONE/VIBE: ${tone}
    ADDITIONAL DETAILS: ${keywords}
    
    Please ensure the content is:
    1. PERSUASIVE: Focus on benefits and solving the audience's problems.
    2. LOCALIZED: Use Malaysian context (Ringgit RM, localized phrases like "best gila", "jom", "mantap" if appropriate for the tone).
    3. CLEAR: Use bullet points where helpful.
    4. ACTION-ORIENTED: Include a strong Call to Action (CTA).

    Format the response using professional Markdown.
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text || "I'm sorry, I couldn't generate content at this moment.";
}

export async function generateProductListing(
  categories: string[],
  productName?: string,
  imageData?: string // base64 string
): Promise<{ description: string; category: string; price: number; tags: string; name?: string }> {
  const model = "gemini-3-flash-preview";
  
  let prompt = `
    You are an expert Malaysian SME Product Specialist.
    TASK: Generate product details for a marketplace listing.
    ALLOWED CATEGORIES: ${categories.join(", ")}
  `;

  if (productName) {
    prompt += `\nPRODUCT NAME: ${productName}`;
  }

  if (imageData) {
    prompt += `\nI have provided an image of the product. Please identify what it is and suggest a catchy PRODUCT NAME if one wasn't provided.`;
  }
    
  prompt += `
    Return a JSON object with:
    - name: A catchy product name (if not provided or if visual suggests better).
    - description: A persuasive, 2-3 sentence description in a Malaysian context.
    - category: The most suitable category from the ALLOWED CATEGORIES list.
    - price: A realistic estimated price in RM (number only).
    - tags: 3-4 comma-separated keywords for visual search (e.g., "batik, clothing, traditional").

    BE CONCISE and helpful.
  `;

  const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];
  
  if (imageData) {
    const [mimeType, base64Data] = imageData.split(';base64,');
    contents[0].parts.push({
      inlineData: {
        mimeType: mimeType.split(':')[1],
        data: base64Data
      }
    });
  }

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: contents[0].parts.map(p => p), // Adjusting for expected format if needed
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      name: productName || "New Product",
      description: "A wonderful product from a local Malaysian SME.",
      category: categories[1],
      price: 50,
      tags: productName?.toLowerCase() || "sme"
    };
  }
}

export async function calculateHealthScore(
  profile: BusinessProfile,
  transactions: Transaction[]
): Promise<{ score: number; factors: any; recommendations: string[] }> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following business data and provide a Health Score (0-100) and factors.
    Business: ${JSON.stringify(profile)}
    Transactions: ${JSON.stringify(transactions)}
    
    Return a JSON object with:
    - score (number)
    - factors (object with revenue, expenses, retention, learning - each 0-100)
    - recommendations (array of strings)
  `;

  const response: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
    },
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {
      score: 70,
      factors: { revenue: 70, expenses: 70, retention: 70, learning: 70 },
      recommendations: ["Keep tracking your finances to get better insights."],
    };
  }
}
