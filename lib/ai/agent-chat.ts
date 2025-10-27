/**
 * AI Agent Chat System
 * Allows users to chat with their email agent
 */

export interface ChatMessage {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
  emailContext?: {
    emailId: string;
    subject: string;
    from: string;
  };
  suggestedActions?: string[];
}

export interface ChatContext {
  agentId: string;
  userId: string;
  recentEmails: any[];
  agentPersonality: string;
}

export class AgentChat {
  /**
   * Process user message and generate agent response
   */
  static async processMessage(
    userMessage: string,
    context: ChatContext
  ): Promise<ChatMessage> {
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Detect user intent
    const intent = this.detectIntent(userMessage);
    
    // Generate response based on intent
    const response = await this.generateResponse(userMessage, intent, context);
    
    // Extract suggested actions
    const suggestedActions = this.extractSuggestedActions(intent, context);
    
    return {
      id: messageId,
      role: 'agent',
      content: response,
      timestamp: new Date().toISOString(),
      suggestedActions,
    };
  }

  private static detectIntent(message: string): string {
    const lower = message.toLowerCase();
    
    // Email management
    if (lower.includes('unread') || lower.includes('new email')) return 'check_unread';
    if (lower.includes('important') || lower.includes('urgent')) return 'check_important';
    if (lower.includes('reply') || lower.includes('respond')) return 'draft_reply';
    if (lower.includes('schedule') || lower.includes('meeting')) return 'schedule_meeting';
    if (lower.includes('summarize') || lower.includes('summary')) return 'summarize_emails';
    if (lower.includes('search') || lower.includes('find')) return 'search_emails';
    
    // Agent management
    if (lower.includes('status') || lower.includes('how are you')) return 'agent_status';
    if (lower.includes('help') || lower.includes('what can you')) return 'help';
    
    return 'general_query';
  }

  private static async generateResponse(
    message: string,
    intent: string,
    context: ChatContext
  ): Promise<string> {
    const responses: Record<string, (ctx: ChatContext) => string> = {
      check_unread: (ctx) => {
        const unreadCount = ctx.recentEmails.filter((e: any) => e.details?.isUnread).length;
        if (unreadCount === 0) {
          return "✅ Great news! You have no unread emails. Your inbox is all caught up!";
        }
        return `📧 You have ${unreadCount} unread email${unreadCount > 1 ? 's' : ''}. Would you like me to summarize them for you?`;
      },
      
      check_important: (ctx) => {
        const important = ctx.recentEmails.filter((e: any) => e.details?.isImportant || e.type === 'action_required');
        if (important.length === 0) {
          return "✅ No urgent emails at the moment. You're all set!";
        }
        const subjects = important.slice(0, 3).map((e: any) => `• ${e.title}`).join('\n');
        return `⚠️ You have ${important.length} important email${important.length > 1 ? 's' : ''}:\n\n${subjects}\n\nWould you like me to help you respond to any of these?`;
      },
      
      draft_reply: () => {
        return "📝 I can help you draft a reply! Please tell me:\n1. Which email you want to reply to\n2. The key points you want to include\n\nOr I can suggest a reply based on the email content.";
      },
      
      schedule_meeting: () => {
        return "📅 I can help you schedule a meeting! I'll:\n1. Check your calendar availability\n2. Suggest optimal times\n3. Draft a meeting invite\n\nWhich email contains the meeting request?";
      },
      
      summarize_emails: (ctx) => {
        const count = Math.min(ctx.recentEmails.length, 5);
        const summaries = ctx.recentEmails.slice(0, count).map((e: any, i: number) => 
          `${i + 1}. **${e.title}**\n   ${e.description}\n   ${e.aiInsights?.recommendation || ''}`
        ).join('\n\n');
        
        return `📊 Here's a summary of your recent emails:\n\n${summaries}\n\nWould you like me to take any action on these?`;
      },
      
      search_emails: () => {
        return "🔍 I can search your emails! What would you like to find?\n\nYou can search by:\n• Sender name\n• Subject keywords\n• Date range\n• Category (career, personal, etc.)";
      },
      
      agent_status: (ctx) => {
        const processed = ctx.recentEmails.length;
        return `🤖 I'm active and monitoring your inbox!\n\n📊 Stats:\n• Emails processed today: ${processed}\n• Active monitoring: ✅\n• AI categorization: ✅\n• Auto-reply: ✅\n\nHow can I help you?`;
      },
      
      help: () => {
        return `🤖 I'm your AI Email Assistant! Here's what I can do:\n\n📧 **Email Management**\n• Check unread and important emails\n• Categorize by priority and topic\n• Draft intelligent replies\n• Schedule meetings\n\n🤖 **AI Features**\n• Smart categorization\n• Sentiment analysis\n• Action item extraction\n• Response time estimation\n\n💬 **Just ask me:**\n• "What are my unread emails?"\n• "Draft a reply to [email]"\n• "Schedule a meeting"\n• "Summarize my inbox"\n\nWhat would you like me to do?`;
      },
      
      general_query: () => {
        return "I'm here to help with your emails! You can ask me to:\n• Check your inbox\n• Draft replies\n• Schedule meetings\n• Summarize emails\n• Search for specific messages\n\nWhat would you like me to do?";
      },
    };
    
    const responseGenerator = responses[intent] || responses.general_query;
    return responseGenerator(context);
  }

  private static extractSuggestedActions(intent: string, context: ChatContext): string[] {
    const actions: Record<string, string[]> = {
      check_unread: ['Summarize all', 'Mark all as read', 'Show important only'],
      check_important: ['Draft replies', 'Schedule time to respond', 'Delegate'],
      draft_reply: ['Use template', 'Schedule send', 'Add to drafts'],
      schedule_meeting: ['Check calendar', 'Suggest times', 'Send invite'],
      summarize_emails: ['Export summary', 'Create tasks', 'Archive read'],
      search_emails: ['Search by sender', 'Search by date', 'Search by category'],
      agent_status: ['View analytics', 'Adjust settings', 'Pause agent'],
      help: ['Quick tutorial', 'View examples', 'Contact support'],
    };
    
    return actions[intent] || ['Ask another question', 'View inbox', 'Settings'];
  }

  /**
   * Generate automated reply for an email
   */
  static generateAutomatedReply(
    email: any,
    replyType: 'acknowledge' | 'schedule' | 'decline' | 'custom',
    customMessage?: string
  ): string {
    const from = email.details?.from || 'there';
    const senderName = from.split('<')[0].trim() || 'there';
    const subject = email.details?.subject || '';
    
    const templates = {
      acknowledge: `Hi ${senderName},\n\nThank you for your email regarding "${subject}".\n\nI've received your message and will review it shortly. I'll get back to you within 24-48 hours.\n\nBest regards`,
      
      schedule: `Hi ${senderName},\n\nThank you for reaching out about scheduling a meeting.\n\nI'm available at the following times:\n• [Time slot 1]\n• [Time slot 2]\n• [Time slot 3]\n\nPlease let me know which works best for you, or suggest an alternative time.\n\nBest regards`,
      
      decline: `Hi ${senderName},\n\nThank you for your email regarding "${subject}".\n\nUnfortunately, I'm unable to accommodate this request at this time. I appreciate your understanding.\n\nBest regards`,
      
      custom: customMessage || `Hi ${senderName},\n\nThank you for your email.\n\nBest regards`,
    };
    
    return templates[replyType];
  }
}
