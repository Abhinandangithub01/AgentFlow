/**
 * Automated Email Actions
 * Handles automated replies, scheduling, and email management
 */

import { google } from 'googleapis';

export interface AutomatedAction {
  id: string;
  type: 'auto_reply' | 'schedule_meeting' | 'categorize' | 'flag' | 'archive' | 'forward';
  emailId: string;
  status: 'pending' | 'completed' | 'failed';
  result?: any;
  error?: string;
  timestamp: string;
}

export interface AutoReplyRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: {
    fromContains?: string[];
    subjectContains?: string[];
    category?: string[];
    priority?: string[];
  };
  action: {
    replyTemplate: string;
    delay?: number; // minutes
    markAsRead?: boolean;
    addLabel?: string;
  };
}

export class AutomatedActions {
  /**
   * Send automated reply to an email
   */
  static async sendAutoReply(
    gmail: any,
    emailId: string,
    replyContent: string,
    originalEmail: any
  ): Promise<AutomatedAction> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Get original email details
      const emailData = await gmail.users.messages.get({
        userId: 'me',
        id: emailId,
        format: 'full',
      });
      
      const headers = emailData.data.payload?.headers || [];
      const to = headers.find((h: any) => h.name === 'From')?.value || '';
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || '';
      const messageId = headers.find((h: any) => h.name === 'Message-ID')?.value || '';
      
      // Create reply
      const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
      
      const rawMessage = [
        `To: ${to}`,
        `Subject: ${replySubject}`,
        `In-Reply-To: ${messageId}`,
        `References: ${messageId}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        replyContent,
      ].join('\n');
      
      const encodedMessage = Buffer.from(rawMessage)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
      
      // Send reply
      await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedMessage,
          threadId: emailData.data.threadId,
        },
      });
      
      return {
        id: actionId,
        type: 'auto_reply',
        emailId,
        status: 'completed',
        result: { sent: true, to, subject: replySubject },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        id: actionId,
        type: 'auto_reply',
        emailId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Schedule a meeting based on email content
   */
  static async scheduleMeeting(
    calendar: any,
    emailContent: any,
    suggestedTime: string,
    attendees: string[]
  ): Promise<AutomatedAction> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Parse suggested time (simplified - in production use proper date parsing)
      const startTime = new Date(suggestedTime);
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour meeting
      
      const event = {
        summary: emailContent.subject || 'Meeting',
        description: `Scheduled via AI Email Agent\n\nOriginal email: ${emailContent.subject}`,
        start: {
          dateTime: startTime.toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: endTime.toISOString(),
          timeZone: 'America/New_York',
        },
        attendees: attendees.map(email => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };
      
      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all',
      });
      
      return {
        id: actionId,
        type: 'schedule_meeting',
        emailId: emailContent.id,
        status: 'completed',
        result: {
          eventId: response.data.id,
          eventLink: response.data.htmlLink,
          startTime: startTime.toISOString(),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        id: actionId,
        type: 'schedule_meeting',
        emailId: emailContent.id,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Categorize and label email
   */
  static async categorizeEmail(
    gmail: any,
    emailId: string,
    category: string
  ): Promise<AutomatedAction> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Create label if it doesn't exist
      const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
      const labels = labelsResponse.data.labels || [];
      
      let labelId = labels.find((l: any) => l.name === category)?.id;
      
      if (!labelId) {
        const createResponse = await gmail.users.labels.create({
          userId: 'me',
          requestBody: {
            name: category,
            labelListVisibility: 'labelShow',
            messageListVisibility: 'show',
          },
        });
        labelId = createResponse.data.id;
      }
      
      // Apply label to email
      await gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          addLabelIds: [labelId],
        },
      });
      
      return {
        id: actionId,
        type: 'categorize',
        emailId,
        status: 'completed',
        result: { category, labelId },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        id: actionId,
        type: 'categorize',
        emailId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Archive email after processing
   */
  static async archiveEmail(gmail: any, emailId: string): Promise<AutomatedAction> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          removeLabelIds: ['INBOX'],
        },
      });
      
      return {
        id: actionId,
        type: 'archive',
        emailId,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        id: actionId,
        type: 'archive',
        emailId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Flag important email
   */
  static async flagEmail(gmail: any, emailId: string): Promise<AutomatedAction> {
    const actionId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      await gmail.users.messages.modify({
        userId: 'me',
        id: emailId,
        requestBody: {
          addLabelIds: ['STARRED'],
        },
      });
      
      return {
        id: actionId,
        type: 'flag',
        emailId,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        id: actionId,
        type: 'flag',
        emailId,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if email matches auto-reply rules
   */
  static shouldAutoReply(email: any, rules: AutoReplyRule[]): AutoReplyRule | null {
    for (const rule of rules) {
      if (!rule.enabled) continue;
      
      const { conditions } = rule;
      let matches = true;
      
      // Check from conditions
      if (conditions.fromContains && conditions.fromContains.length > 0) {
        const from = email.details?.from?.toLowerCase() || '';
        matches = matches && conditions.fromContains.some(term => from.includes(term.toLowerCase()));
      }
      
      // Check subject conditions
      if (conditions.subjectContains && conditions.subjectContains.length > 0) {
        const subject = email.details?.subject?.toLowerCase() || '';
        matches = matches && conditions.subjectContains.some(term => subject.includes(term.toLowerCase()));
      }
      
      // Check category
      if (conditions.category && conditions.category.length > 0) {
        matches = matches && conditions.category.includes(email.aiInsights?.category);
      }
      
      // Check priority
      if (conditions.priority && conditions.priority.length > 0) {
        matches = matches && conditions.priority.includes(email.aiInsights?.priority);
      }
      
      if (matches) return rule;
    }
    
    return null;
  }
}
