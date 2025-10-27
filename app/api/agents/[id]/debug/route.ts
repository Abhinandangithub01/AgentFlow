import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { agentManager } from '@/lib/agent-manager';
import { tokenVault } from '@/lib/token-vault';

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

    // Get agent
    const agent = await agentManager.getAgent(agentId, userId);
    if (!agent) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    // Check Gmail detection
    const agentConfig = agent.metadata?.config || agent.metadata;
    const hasGmailService = agentConfig?.services?.includes('gmail') || 
                           agentConfig?.services?.includes('Gmail') ||
                           agent.type === 'email_assistant' ||
                           agent.name?.toLowerCase().includes('gmail') ||
                           agent.name?.toLowerCase().includes('email');

    // Check Gmail token
    const gmailToken = await tokenVault.getOAuthToken(userId, 'gmail');

    return NextResponse.json({
      debug: {
        agentId,
        agentName: agent.name,
        agentType: agent.type,
        agentConfig: agentConfig,
        services: agentConfig?.services,
        hasGmailService,
        hasGmailToken: !!gmailToken,
        gmailTokenDetails: gmailToken ? {
          hasAccessToken: !!gmailToken.accessToken,
          hasRefreshToken: !!gmailToken.refreshToken,
          expiresAt: gmailToken.expiresAt
        } : null,
        detectionChecks: {
          servicesIncludesGmail: agentConfig?.services?.includes('gmail'),
          servicesIncludesGmailCap: agentConfig?.services?.includes('Gmail'),
          typeIsEmailAssistant: agent.type === 'email_assistant',
          nameIncludesGmail: agent.name?.toLowerCase().includes('gmail'),
          nameIncludesEmail: agent.name?.toLowerCase().includes('email')
        }
      }
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
