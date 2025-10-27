/**
 * AI Email Processor
 * Analyzes emails and provides intelligent actions
 */

export interface EmailAnalysis {
  category: 'career' | 'newsletter' | 'security' | 'product' | 'personal' | 'meeting' | 'urgent' | 'general';
  priority: 'urgent' | 'high' | 'normal' | 'low';
  sentiment: 'positive' | 'neutral' | 'negative';
  intent: string;
  keyPoints: string[];
  suggestedReply?: string;
  requiresAction: boolean;
  actionItems: string[];
  estimatedResponseTime: string;
  schedulingInfo?: {
    hasMeetingRequest: boolean;
    suggestedTimes?: string[];
    meetingType?: string;
  };
}

export class AIEmailProcessor {
  /**
   * Analyze email content with AI
   */
  static analyzeEmail(subject: string, from: string, body: string = ''): EmailAnalysis {
    const subjectLower = subject.toLowerCase();
    const bodyLower = body.toLowerCase();
    const fromLower = from.toLowerCase();
    
    // Detect category
    const category = this.detectCategory(subjectLower, fromLower, bodyLower);
    
    // Detect priority
    const priority = this.detectPriority(subjectLower, bodyLower, category);
    
    // Detect sentiment
    const sentiment = this.detectSentiment(subjectLower, bodyLower);
    
    // Extract intent
    const intent = this.extractIntent(subjectLower, bodyLower, category);
    
    // Extract key points
    const keyPoints = this.extractKeyPoints(subject, body);
    
    // Check for scheduling
    const schedulingInfo = this.detectScheduling(subjectLower, bodyLower);
    
    // Detect action items
    const actionItems = this.extractActionItems(subjectLower, bodyLower, category);
    
    // Generate suggested reply
    const suggestedReply = this.generateSuggestedReply(category, priority, intent, from);
    
    // Estimate response time
    const estimatedResponseTime = this.estimateResponseTime(priority, category);
    
    return {
      category,
      priority,
      sentiment,
      intent,
      keyPoints,
      suggestedReply,
      requiresAction: actionItems.length > 0 || priority === 'urgent',
      actionItems,
      estimatedResponseTime,
      schedulingInfo,
    };
  }

  private static detectCategory(subject: string, from: string, body: string): EmailAnalysis['category'] {
    // Meeting requests
    if (subject.includes('meeting') || subject.includes('schedule') || subject.includes('calendar') ||
        body.includes('meet') || body.includes('zoom') || body.includes('teams')) {
      return 'meeting';
    }
    
    // Career/Job related
    if (subject.includes('job') || subject.includes('career') || subject.includes('interview') || 
        subject.includes('position') || subject.includes('hiring') || from.includes('linkedin') ||
        from.includes('recruit')) {
      return 'career';
    }
    
    // Urgent/Important
    if (subject.includes('urgent') || subject.includes('asap') || subject.includes('important') ||
        subject.includes('critical') || subject.includes('immediate')) {
      return 'urgent';
    }
    
    // Security
    if (subject.includes('security') || subject.includes('alert') || subject.includes('warning') ||
        subject.includes('suspicious') || subject.includes('verify') || subject.includes('password')) {
      return 'security';
    }
    
    // Newsletters
    if (subject.includes('newsletter') || subject.includes('digest') || subject.includes('weekly') ||
        from.includes('newsletter') || from.includes('noreply')) {
      return 'newsletter';
    }
    
    // Product updates
    if (subject.includes('product') || subject.includes('launch') || subject.includes('new feature') ||
        subject.includes('update') || subject.includes('announcement')) {
      return 'product';
    }
    
    // Personal
    if (!from.includes('noreply') && !from.includes('@company') && from.includes('gmail.com')) {
      return 'personal';
    }
    
    return 'general';
  }

  private static detectPriority(subject: string, body: string, category: string): EmailAnalysis['priority'] {
    // Urgent keywords
    if (subject.includes('urgent') || subject.includes('asap') || subject.includes('critical') ||
        subject.includes('immediate') || body.includes('urgent') || category === 'urgent' || category === 'security') {
      return 'urgent';
    }
    
    // High priority
    if (subject.includes('important') || subject.includes('action required') || 
        category === 'career' || category === 'meeting') {
      return 'high';
    }
    
    // Low priority
    if (category === 'newsletter' || category === 'product') {
      return 'low';
    }
    
    return 'normal';
  }

  private static detectSentiment(subject: string, body: string): EmailAnalysis['sentiment'] {
    const positiveWords = ['thank', 'great', 'excellent', 'congratulations', 'approved', 'success', 'happy'];
    const negativeWords = ['issue', 'problem', 'error', 'failed', 'reject', 'cancel', 'complaint'];
    
    const text = subject + ' ' + body;
    const hasPositive = positiveWords.some(word => text.includes(word));
    const hasNegative = negativeWords.some(word => text.includes(word));
    
    if (hasPositive && !hasNegative) return 'positive';
    if (hasNegative && !hasPositive) return 'negative';
    return 'neutral';
  }

  private static extractIntent(subject: string, body: string, category: string): string {
    const intents: Record<string, string> = {
      career: 'Job opportunity or career advancement',
      meeting: 'Schedule a meeting or discussion',
      security: 'Security alert requiring immediate attention',
      newsletter: 'Informational update or news',
      product: 'Product update or announcement',
      personal: 'Personal communication',
      urgent: 'Urgent matter requiring immediate response',
      general: 'General inquiry or information',
    };
    
    return intents[category] || 'General communication';
  }

  private static extractKeyPoints(subject: string, body: string): string[] {
    const points: string[] = [];
    
    // Add subject as first key point
    if (subject) {
      points.push(subject);
    }
    
    // Extract sentences with action words
    const actionWords = ['please', 'need', 'require', 'must', 'should', 'can you', 'would you'];
    const sentences = body.split(/[.!?]+/).filter(s => s.trim().length > 10);
    
    sentences.forEach(sentence => {
      const lower = sentence.toLowerCase();
      if (actionWords.some(word => lower.includes(word))) {
        points.push(sentence.trim());
      }
    });
    
    return points.slice(0, 3); // Return top 3 key points
  }

  private static detectScheduling(subject: string, body: string): EmailAnalysis['schedulingInfo'] {
    const hasMeetingRequest = 
      subject.includes('meeting') || subject.includes('schedule') || subject.includes('calendar') ||
      body.includes('meet') || body.includes('available') || body.includes('time to talk');
    
    if (!hasMeetingRequest) {
      return { hasMeetingRequest: false };
    }
    
    // Detect meeting type
    let meetingType = 'general';
    if (body.includes('interview')) meetingType = 'interview';
    else if (body.includes('demo')) meetingType = 'demo';
    else if (body.includes('sync') || body.includes('catch up')) meetingType = 'sync';
    else if (body.includes('review')) meetingType = 'review';
    
    // Suggest times (simplified - in production, use NLP)
    const suggestedTimes = [
      'Tomorrow at 2:00 PM',
      'Next Monday at 10:00 AM',
      'This Friday at 3:00 PM',
    ];
    
    return {
      hasMeetingRequest: true,
      suggestedTimes,
      meetingType,
    };
  }

  private static extractActionItems(subject: string, body: string, category: string): string[] {
    const actions: string[] = [];
    
    // Category-specific actions
    switch (category) {
      case 'career':
        actions.push('Review job description');
        actions.push('Update resume');
        actions.push('Schedule interview');
        break;
      case 'meeting':
        actions.push('Check calendar availability');
        actions.push('Send meeting invite');
        actions.push('Prepare agenda');
        break;
      case 'security':
        actions.push('Verify account security');
        actions.push('Change password');
        actions.push('Enable 2FA');
        break;
      case 'urgent':
        actions.push('Respond immediately');
        actions.push('Escalate if needed');
        break;
      default:
        if (subject.includes('review') || body.includes('review')) {
          actions.push('Review and provide feedback');
        }
        if (subject.includes('approve') || body.includes('approve')) {
          actions.push('Approve or reject');
        }
    }
    
    return actions;
  }

  private static generateSuggestedReply(
    category: string,
    priority: string,
    intent: string,
    from: string
  ): string {
    const senderName = from.split('<')[0].trim() || 'there';
    
    const templates: Record<string, string> = {
      career: `Hi ${senderName},\n\nThank you for reaching out about this opportunity. I'm interested in learning more.\n\nCould you please share more details about the role and next steps?\n\nBest regards`,
      meeting: `Hi ${senderName},\n\nThank you for the meeting request. I'd be happy to connect.\n\nI'm available [suggest your times]. Please let me know what works best for you.\n\nBest regards`,
      security: `Thank you for the security alert. I've reviewed my account and taken necessary precautions.\n\nPlease let me know if any additional action is required.\n\nBest regards`,
      newsletter: `Thank you for the update. I've reviewed the information.\n\nBest regards`,
      urgent: `Hi ${senderName},\n\nI've received your urgent message and am looking into this immediately.\n\nI'll get back to you within [timeframe] with an update.\n\nBest regards`,
      personal: `Hi ${senderName},\n\nThank you for your message. [Your response here]\n\nBest regards`,
    };
    
    return templates[category] || `Hi ${senderName},\n\nThank you for your email. I'll review this and get back to you shortly.\n\nBest regards`;
  }

  private static estimateResponseTime(priority: string, category: string): string {
    const times: Record<string, string> = {
      urgent: 'Within 2 hours',
      high: 'Within 24 hours',
      normal: 'Within 2-3 days',
      low: 'Within a week',
    };
    
    return times[priority] || 'Within 2-3 days';
  }
}
