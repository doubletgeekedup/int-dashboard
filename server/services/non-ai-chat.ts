import type { IStorage } from "../storage";

export interface ChatResponse {
  response: string;
  data?: any;
  analysisType?: 'general';
}

export class NonAIChatService {
  constructor(private storage: IStorage) {
  }

  /**
   * Process user message and return structured response without AI
   */
  async processMessage(message: string, sourceCode?: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();

    // Check for basic data queries
    if (this.isDataRequest(lowerMessage)) {
      return this.handleDataRequest(message, lowerMessage);
    }

    // General system information (includes new commands)
    return this.handleGeneralRequest(message, sourceCode);
  }

  /**
   * Handle basic data requests
   */
  private async handleDataRequest(originalMessage: string, lowerMessage: string): Promise<ChatResponse> {
    if (lowerMessage.includes('count') || lowerMessage.includes('how many')) {
      return this.handleCountRequest(lowerMessage);
    }
    
    return {
      response: "I can help you with basic system information. Try asking about node counts, source status, or system health.",
      analysisType: 'general'
    };
  }

  /**
   * Handle count requests
   */
  private async handleCountRequest(lowerMessage: string): Promise<ChatResponse> {
    try {
      const sources = await this.storage.getSources();
      const transactions = await this.storage.getTransactions();
      const bulletins = await this.storage.getBulletins();
      
      let response = `System Summary:
- Sources: ${sources.length}
- Recent Transactions: ${transactions.length}
- Bulletins: ${bulletins.length}`;

      if (lowerMessage.includes('source')) {
        response = `Current sources: ${sources.map(s => s.name).join(', ')}. Total: ${sources.length} sources.`;
      }

      return {
        response,
        data: { sources: sources.length, transactions: transactions.length, bulletins: bulletins.length },
        analysisType: 'general'
      };
    } catch (error) {
      return {
        response: "Unable to retrieve system counts at this time.",
        analysisType: 'general'
      };
    }
  }

  /**
   * Handle general system information requests
   */
  private async handleGeneralRequest(message: string, sourceCode?: string): Promise<ChatResponse> {
    const lowerMessage = message.toLowerCase();
    
    // Handle help commands
    if (lowerMessage.includes('help') || lowerMessage.includes('command')) {
      return await this.handleHelpRequest(sourceCode);
    }

    // Handle status requests
    if (lowerMessage.includes('status') || lowerMessage.includes('health')) {
      return await this.handleStatusRequest();
    }

    // Handle source information requests
    if (lowerMessage.includes('source') && (lowerMessage.includes('list') || lowerMessage.includes('show'))) {
      return await this.handleSourceListRequest();
    }

    // Default response with available commands
    return {
      response: `I can help you with:
• System status and health
• Source information
• Node and transaction counts
• Available commands (type "help")

What would you like to know?`,
      analysisType: 'general'
    };
  }

  /**
   * Handle help requests
   */
  private async handleHelpRequest(sourceCode?: string): Promise<ChatResponse> {
    const commands = [
      "• **System Info**: 'status', 'health', 'show sources'",
      "• **Counts**: 'how many sources', 'count transactions'", 
      "• **General**: 'help', 'commands'"
    ];

    let helpText = `**Available Commands:**\n${commands.join('\n')}`;
    
    if (sourceCode) {
      helpText += `\n\n**Current Source**: ${sourceCode}`;
    }

    helpText += `\n\n**Note**: AI Assistant is disabled. For advanced analysis, contact your administrator.`;

    return {
      response: helpText,
      analysisType: 'general'
    };
  }

  /**
   * Handle status requests
   */
  private async handleStatusRequest(): Promise<ChatResponse> {
    try {
      const sources = await this.storage.getSources();
      const healthySources = sources.filter(s => s.status === 'active').length;
      
      const response = `**System Status:**
• Total Sources: ${sources.length}
• Active Sources: ${healthySources}
• System Health: ${healthySources === sources.length ? 'Good' : 'Degraded'}
• Mode: Direct Mode (AI disabled)`;

      return {
        response,
        data: { total: sources.length, healthy: healthySources },
        analysisType: 'general'
      };
    } catch (error) {
      return {
        response: "Unable to retrieve system status at this time.",
        analysisType: 'general'
      };
    }
  }

  /**
   * Handle source list requests
   */
  private async handleSourceListRequest(): Promise<ChatResponse> {
    try {
      const sources = await this.storage.getSources();
      const sourceList = sources.map(s => `• **${s.name}** (${s.code}) - ${s.status}`).join('\n');
      
      const response = `**Available Sources:**\n${sourceList}\n\nTotal: ${sources.length} sources`;

      return {
        response,
        data: sources,
        analysisType: 'general'
      };
    } catch (error) {
      return {
        response: "Unable to retrieve source list at this time.",
        analysisType: 'general'
      };
    }
  }

  /**
   * Check if message is a data request
   */
  private isDataRequest(message: string): boolean {
    const dataKeywords = ['count', 'how many', 'show', 'list', 'status', 'health'];
    return dataKeywords.some(keyword => message.includes(keyword));
  }
}

export const nonAIChatService = new NonAIChatService(null as any); // Will be initialized with storage