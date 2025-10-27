import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';
import { tokenVault } from '@/lib/token-vault';
import { agentManager } from '@/lib/agent-manager';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const userId = session.user.sub;

    console.log('[Activity] Fetching real Gmail data for agent:', agentId, 'user:', userId);

    // Get agent to check which services are connected
    const agent = await agentManager.getAgent(agentId, userId);
    if (!agent) {
      console.log('[Activity] Agent not found:', agentId);
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    console.log('[Activity] Agent found:', agent.name);
    console.log('[Activity] Agent metadata:', JSON.stringify(agent.metadata, null, 2));

    const activities: any[] = [];

    // Fetch Gmail activity if Gmail is connected
    const agentConfig = agent.metadata?.config || agent.metadata;
    console.log('[Activity] Agent config:', JSON.stringify(agentConfig, null, 2));
    console.log('[Activity] Services in config:', agentConfig?.services);
    
    // Check if Gmail is in services OR if agent type suggests email functionality
    const hasGmailService = agentConfig?.services?.includes('gmail') || 
                           agentConfig?.services?.includes('Gmail') ||
                           agent.type === 'email_assistant' ||
                           agent.name?.toLowerCase().includes('gmail') ||
                           agent.name?.toLowerCase().includes('email');
    
    console.log('[Activity] Should fetch Gmail:', hasGmailService);
    
    if (hasGmailService) {
      try {
        // Get Gmail token from vault
        const gmailToken = await tokenVault.getOAuthToken(userId, 'gmail');
        
        if (gmailToken) {
          console.log('[Activity] Gmail token found, fetching emails...');
          
          // Initialize Gmail API
          const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET
          );
          
          oauth2Client.setCredentials({
            access_token: gmailToken.accessToken,
            refresh_token: gmailToken.refreshToken
          });
          
          const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
          
          // Fetch emails from past 24 hours (more reliable query)
          const oneDayAgo = Math.floor(Date.now() / 1000) - (24 * 60 * 60);
          console.log('[Activity] Fetching emails after:', new Date(oneDayAgo * 1000).toISOString());
          
          const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 20,
            q: `after:${oneDayAgo}`
          });
          
          const messages = response.data.messages || [];
          console.log('[Activity] Found', messages.length, 'recent emails from past 24 hours');
          
          if (messages.length === 0) {
            console.log('[Activity] No emails found in past 24 hours');
            activities.push({
              id: 'no-emails',
              agentId,
              type: 'info',
              icon: '📭',
              title: 'No recent emails',
              description: 'No emails received in the past 24 hours',
              timestamp: new Date().toISOString()
            });
          }
          
          // Fetch details for each email (process up to 10)
          for (const message of messages.slice(0, 10)) {
            try {
              const emailData = await gmail.users.messages.get({
                userId: 'me',
                id: message.id!,
                format: 'metadata',
                metadataHeaders: ['From', 'Subject', 'Date']
              });
              
              const headers = emailData.data.payload?.headers || [];
              const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
              const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
              const date = headers.find(h => h.name === 'Date')?.value || '';
              
              const isUnread = emailData.data.labelIds?.includes('UNREAD');
              const isImportant = emailData.data.labelIds?.includes('IMPORTANT');
              
              // AI-powered categorization
              const category = categorizeEmail(subject, from);
              const priority = isImportant ? 'urgent' : (isUnread ? 'high' : 'normal');
              const aiRecommendation = generateAIRecommendation(subject, from, category, priority);
              
              activities.push({
                id: message.id,
                agentId,
                type: isImportant ? 'action_required' : 'success',
                icon: isImportant ? '⚠️' : '📧',
                title: isUnread ? `New email: ${subject}` : `Read: ${subject}`,
                description: `From: ${from}`,
                timestamp: date || new Date().toISOString(),
                details: {
                  from,
                  subject,
                  isUnread,
                  isImportant,
                  messageId: message.id
                },
                aiInsights: {
                  category,
                  priority,
                  recommendation: aiRecommendation,
                  suggestedActions: getSuggestedActions(category, priority),
                  estimatedResponseTime: estimateResponseTime(priority)
                }
              });
            } catch (err) {
              console.error('[Activity] Error fetching email details:', err);
            }
          }
          
          // Add summary activity
          if (messages.length > 0) {
            const unreadCount = messages.filter(m => 
              m.id && activities.find(a => a.details?.messageId === m.id && a.details?.isUnread)
            ).length;
            
            activities.unshift({
              id: 'summary-' + Date.now(),
              agentId,
              type: 'success',
              icon: '📧',
              title: `Processed ${messages.length} emails from Gmail`,
              description: `${unreadCount} unread, ${messages.length - unreadCount} read`,
              timestamp: new Date().toISOString(),
              details: {
                total: messages.length,
                unread: unreadCount,
                read: messages.length - unreadCount
              }
            });
          }
        } else {
          console.log('[Activity] No Gmail token found');
          activities.push({
            id: 'no-token',
            agentId,
            type: 'warning',
            icon: '⚠️',
            title: 'Gmail not connected',
            description: 'Please connect your Gmail account to see email activity',
            timestamp: new Date().toISOString()
          });
        }
      } catch (error: any) {
        console.error('[Activity] Gmail API error:', error.message);
        activities.push({
          id: 'error-' + Date.now(),
          agentId,
          type: 'warning',
          icon: '⚠️',
          title: 'Error fetching Gmail data',
          description: error.message || 'Failed to fetch emails',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      console.log('[Activity] Gmail NOT in agent services. Agent config services:', agentConfig?.services);
      console.log('[Activity] Full agent object:', JSON.stringify(agent, null, 2));
    }

    // If no activities yet, add a placeholder
    if (activities.length === 0) {
      console.log('[Activity] No activities found, adding placeholder');
      activities.push({
        id: 'no-activity',
        agentId,
        type: 'info',
        icon: '🤖',
        title: 'Agent is ready',
        description: 'Waiting for tasks... Connect services to get started!',
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agentId = params.id;
    const body = await request.json();

    // In production, save activity to database
    const newActivity = {
      id: String(Date.now()),
      agentId,
      ...body,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json({ activity: newActivity }, { status: 201 });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// AI Helper Functions
function categorizeEmail(subject: string, from: string): string {
  const subjectLower = subject.toLowerCase();
  const fromLower = from.toLowerCase();
  
  // Job/Career related
  if (subjectLower.includes('job') || subjectLower.includes('career') || subjectLower.includes('interview') || 
      subjectLower.includes('position') || subjectLower.includes('hiring') || fromLower.includes('linkedin') ||
      fromLower.includes('job') || fromLower.includes('recruit')) {
    return 'career';
  }
  
  // Newsletters
  if (subjectLower.includes('newsletter') || subjectLower.includes('digest') || subjectLower.includes('weekly') ||
      subjectLower.includes('update') || fromLower.includes('newsletter') || fromLower.includes('noreply')) {
    return 'newsletter';
  }
  
  // Security/Alerts
  if (subjectLower.includes('security') || subjectLower.includes('alert') || subjectLower.includes('warning') ||
      subjectLower.includes('suspicious') || subjectLower.includes('verify') || subjectLower.includes('password')) {
    return 'security';
  }
  
  // Product/Marketing
  if (subjectLower.includes('product') || subjectLower.includes('launch') || subjectLower.includes('new feature') ||
      subjectLower.includes('update') || subjectLower.includes('announcement')) {
    return 'product';
  }
  
  // Personal
  if (!fromLower.includes('noreply') && !fromLower.includes('@') || fromLower.includes('gmail.com')) {
    return 'personal';
  }
  
  return 'general';
}

function generateAIRecommendation(subject: string, from: string, category: string, priority: string): string {
  const recommendations: Record<string, string> = {
    career: priority === 'urgent' 
      ? 'Respond within 24 hours to maintain professional interest' 
      : 'Review and respond when you have time to craft a thoughtful reply',
    newsletter: 'Archive for later reading or unsubscribe if not valuable',
    security: 'Review immediately and take necessary action to secure your account',
    product: 'Read to stay updated on product changes that may affect your workflow',
    personal: priority === 'urgent'
      ? 'Respond promptly to maintain personal relationships'
      : 'Reply when convenient',
    general: 'Review and categorize appropriately'
  };
  
  return recommendations[category] || recommendations.general;
}

function getSuggestedActions(category: string, priority: string): string[] {
  const baseActions = ['Reply', 'Archive', 'Mark as Read'];
  
  const categoryActions: Record<string, string[]> = {
    career: ['Draft Reply', 'Schedule Interview', 'Save to Jobs Folder', 'Forward to Recruiter'],
    newsletter: ['Read Later', 'Unsubscribe', 'Mark as Read', 'Archive'],
    security: ['Verify Account', 'Change Password', 'Enable 2FA', 'Report Phishing'],
    product: ['Read Now', 'Share with Team', 'Add to Notes', 'Archive'],
    personal: ['Reply', 'Schedule Call', 'Add to Calendar', 'Forward'],
    general: baseActions
  };
  
  return categoryActions[category] || baseActions;
}

function estimateResponseTime(priority: string): string {
  const times: Record<string, string> = {
    urgent: 'Within 2 hours',
    high: 'Within 24 hours',
    normal: 'Within 3 days',
    low: 'When convenient'
  };
  
  return times[priority] || times.normal;
}
