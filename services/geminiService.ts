import { GoogleGenAI } from "@google/genai";
import { TableRowData } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
};

export const analyzeInventory = async (data: TableRowData[], dateStr: string): Promise<string> => {
  const client = getAIClient();
  if (!client) {
    return "API Key is missing. Please ensure process.env.API_KEY is configured.";
  }

  // Optimize payload size
  const summary = data.map(d => ({
    name: d.name,
    stock: d.calculatedStock,
    sales: d.salesOut,
    in: d.purchaseIn,
    discrepancy: d.discrepancy
  })).filter(d => d.stock > 0 || d.sales > 0 || d.in > 0 || d.discrepancy !== 0);

  const prompt = `
    Analyze the inventory data for ${dateStr}.
    Data (JSON): ${JSON.stringify(summary)}
    
    Please provide a concise management summary in Chinese (中文).
    Focus on:
    1. Top selling items today.
    2. Items with low stock that might need replenishment.
    3. Any significant discrepancies (where manual count != calculated).
    4. A general sentiment on today's movement.
    
    Format nicely with markdown bullet points.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate analysis. Please try again later.";
  }
};
