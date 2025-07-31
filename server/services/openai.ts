import OpenAI from "openai";
import { configManager, type OpenAIConfig } from '../config.js';
import type { IStorage } from "../storage";

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AnalysisRequest {
  data: any;
  context: string;
  source?: string;
}

export interface AnalysisResult {
  insights: string[];
  recommendations: string[];
  summary: string;
  confidence: number;
}

export class OpenAIService {
  private client: OpenAI;
  private config: OpenAIConfig;

  constructor() {
    this.config = configManager.getOpenAIConfig();
    this.client = new OpenAI({
      apiKey: this.config.api_key
    });
  }

  async chatCompletion(messages: ChatMessage[], storage?: IStorage): Promise<string> {
    try {
      if (!this.config.features.chat_analysis) {
        throw new Error("Chat analysis is disabled in configuration");
      }

      // Initialize similarity services if storage is provided and not already initialized
      if (storage && !this.similarityService) {
        this.initializeSimilarityServices(storage);
      }

      // For now, use messages as-is - similarity enhancement can be added later
      const response = await this.client.chat.completions.create({
        model: this.config.model, // Uses gpt-4o from YAML config
        messages: messages,
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
      });

      return response.choices[0].message.content || "No response generated";
    } catch (error) {
      console.error("OpenAI chat completion error:", error);
      throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async analyzeData(request: AnalysisRequest): Promise<AnalysisResult> {
    try {
      if (!this.config.features.data_insights) {
        throw new Error("Data insights are disabled in configuration");
      }

      const systemPrompt = `You are an expert data analyst for an integration dashboard system. 
      Analyze the provided data and context to generate insights, recommendations, and a summary.
      Focus on system performance, integration health, and actionable recommendations.
      Respond with JSON in this format: {
        "insights": ["insight1", "insight2", ...],
        "recommendations": ["recommendation1", "recommendation2", ...], 
        "summary": "overall summary",
        "confidence": 0.85
      }`;

      const userPrompt = `Context: ${request.context}
      ${request.source ? `Source: ${request.source}` : ''}
      Data to analyze: ${JSON.stringify(request.data, null, 2)}`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: this.config.max_tokens,
        temperature: this.config.temperature,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("No analysis content generated");
      }

      return JSON.parse(content) as AnalysisResult;
    } catch (error) {
      console.error("OpenAI data analysis error:", error);
      throw new Error(`Failed to analyze data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePerformanceRecommendations(metrics: any): Promise<string[]> {
    try {
      if (!this.config.features.performance_recommendations) {
        throw new Error("Performance recommendations are disabled in configuration");
      }

      const prompt = `Based on these system performance metrics, provide 3-5 specific, actionable recommendations to improve system performance:
      
      ${JSON.stringify(metrics, null, 2)}
      
      Respond with JSON array of recommendation strings: ["recommendation1", "recommendation2", ...]`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: Math.min(this.config.max_tokens, 500),
        temperature: this.config.temperature,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      if (!content) {
        return [];
      }

      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : parsed.recommendations || [];
    } catch (error) {
      console.error("OpenAI performance recommendations error:", error);
      return ["Unable to generate recommendations at this time"];
    }
  }

  async summarizeSystemHealth(healthData: any): Promise<string> {
    try {
      const prompt = `Provide a concise 2-3 sentence summary of the overall system health based on this data:
      
      ${JSON.stringify(healthData, null, 2)}`;

      const response = await this.client.chat.completions.create({
        model: this.config.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
        temperature: 0.3, // Lower temperature for consistent summaries
      });

      return response.choices[0].message.content || "System health summary unavailable";
    } catch (error) {
      console.error("OpenAI health summary error:", error);
      return "Unable to generate system health summary";
    }
  }

  isFeatureEnabled(feature: 'chat' | 'insights' | 'recommendations'): boolean {
    switch (feature) {
      case 'chat':
        return this.config.features.chat_analysis;
      case 'insights':
        return this.config.features.data_insights;
      case 'recommendations':
        return this.config.features.performance_recommendations;
      default:
        return false;
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();