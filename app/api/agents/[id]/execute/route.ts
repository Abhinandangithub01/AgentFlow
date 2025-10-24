import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { analyzeEmail, extractTasks, generateEmailDraft } from '@/lib/groq';

// Mock email data - in production, this would come from Gmail API
const mockEmails = [
  {
    id: '1',
    subject: 'Urgent: Project Deadline Change',
    from: 'client@company.com',
    body: 'Hi, we need to move the project deadline from Friday to Wednesday. Can you accommodate this change? Please confirm ASAP. Also, we need the final report by EOD Tuesday.',
    receivedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    subject: 'Weekly Newsletter - Tech Updates',
    from: 'newsletter@techblog.com',
    body: 'Here are this week\'s top tech stories: AI advances, new frameworks, and industry news...',
    receivedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    subject: 'Invoice #1234 - Payment Reminder',
    from: 'billing@vendor.com',
    body: 'This is a friendly reminder that Invoice #1234 for $5,000 is now 14 days overdue. Please process payment at your earliest convenience.',
    receivedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    subject: 'Meeting Request: Q1 Planning',
    from: 'manager@company.com',
    body: 'Let\'s schedule a meeting next week to discuss Q1 planning. I\'m available Tuesday 2-4pm or Thursday 10am-12pm. Please let me know what works for you.',
    receivedAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
];

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
    const { action } = body;

    console.log(`Executing agent ${agentId} with action: ${action}`);

    // Simulate different agent actions
    if (action === 'scan-emails' || action === 'email-scan') {
      // Process emails with GROQ AI
      const results = [];
      
      for (const email of mockEmails) {
        // Analyze email with GROQ
        const analysis = await analyzeEmail(email.subject, email.body, email.from);
        
        // Extract tasks if email requires action
        let tasks = null;
        if (analysis.requiresAction) {
          tasks = await extractTasks(`${email.subject}\n\n${email.body}`);
        }

        // Generate draft response for urgent/client emails
        let draft = null;
        if (analysis.category === 'urgent' || analysis.category === 'client') {
          draft = await generateEmailDraft(
            `Subject: ${email.subject}\nFrom: ${email.from}\n\n${email.body}`,
            'Acknowledge receipt and provide professional response',
            'professional'
          );
        }

        results.push({
          email: {
            id: email.id,
            subject: email.subject,
            from: email.from,
            receivedAt: email.receivedAt,
          },
          analysis,
          tasks: tasks?.tasks || [],
          actionItems: tasks?.actionItems || [],
          draft,
        });
      }

      // Sort by priority
      results.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.analysis.priority] - priorityOrder[b.analysis.priority];
      });

      return NextResponse.json({
        success: true,
        action: 'scan-emails',
        executedAt: new Date().toISOString(),
        results: {
          totalEmails: mockEmails.length,
          categorized: {
            urgent: results.filter(r => r.analysis.category === 'urgent').length,
            client: results.filter(r => r.analysis.category === 'client').length,
            newsletter: results.filter(r => r.analysis.category === 'newsletter').length,
            other: results.filter(r => r.analysis.category === 'other').length,
          },
          requiresAction: results.filter(r => r.analysis.requiresAction).length,
          draftsCreated: results.filter(r => r.draft !== null).length,
          totalTasks: results.reduce((sum, r) => sum + r.tasks.length, 0),
          emails: results,
        },
      });
    }

    // Default response for other actions
    return NextResponse.json({
      success: true,
      action,
      executedAt: new Date().toISOString(),
      message: 'Agent executed successfully',
    });

  } catch (error) {
    console.error('Agent execution error:', error);
    return NextResponse.json(
      { error: 'Failed to execute agent', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
