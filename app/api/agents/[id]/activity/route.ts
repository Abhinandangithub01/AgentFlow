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
    console.log('[Activity] Checking if gmail is in services:', agentConfig?.services?.includes('gmail'));
    
    if (agentConfig?.services?.includes('gmail')) {
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
          
          // Fetch recent emails
          const response = await gmail.users.messages.list({
            userId: 'me',
            maxResults: 10,
            q: 'is:unread OR newer_than:1d'
          });
          
          const messages = response.data.messages || [];
          console.log('[Activity] Found', messages.length, 'recent emails');
          
          // Fetch details for each email
          for (const message of messages.slice(0, 5)) {
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
