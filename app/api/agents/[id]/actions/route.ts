import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { google } from 'googleapis';
import { tokenVault } from '@/lib/improved-token-manager';
import { agentManager } from '@/lib/agent-manager';
import { AutomatedActions } from '@/lib/ai/automated-actions';
import { AgentChat } from '@/lib/ai/agent-chat';

export const dynamic = 'force-dynamic';

/**
 * Execute automated action on an email
 */
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
    const userId = session.user.sub;
    const body = await request.json();
    
    const { action, emailId, data } = body;

    // Get Gmail token
    const gmailToken = await tokenVault.getOAuthToken(userId, 'gmail');
    if (!gmailToken) {
      return NextResponse.json({ error: 'Gmail not connected' }, { status: 400 });
    }

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
    
    let result;

    switch (action) {
      case 'auto_reply':
        const replyContent = data.replyContent || AgentChat.generateAutomatedReply(
          data.email,
          data.replyType || 'acknowledge',
          data.customMessage
        );
        result = await AutomatedActions.sendAutoReply(
          gmail,
          emailId,
          replyContent,
          data.email
        );
        break;

      case 'schedule_meeting':
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        result = await AutomatedActions.scheduleMeeting(
          calendar,
          data.email,
          data.suggestedTime,
          data.attendees || []
        );
        break;

      case 'categorize':
        result = await AutomatedActions.categorizeEmail(
          gmail,
          emailId,
          data.category
        );
        break;

      case 'archive':
        result = await AutomatedActions.archiveEmail(gmail, emailId);
        break;

      case 'flag':
        result = await AutomatedActions.flagEmail(gmail, emailId);
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error('[Actions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to execute action', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Get action history
 */
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
    
    // TODO: Retrieve action history from database
    // For now, return empty array
    
    return NextResponse.json({ actions: [] });
  } catch (error: any) {
    console.error('[Actions] Error:', error);
    return NextResponse.json(
      { error: 'Failed to get actions', details: error.message },
      { status: 500 }
    );
  }
}
