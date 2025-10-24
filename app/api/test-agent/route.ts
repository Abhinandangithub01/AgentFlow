import { NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import { analyzeEmail, extractTasks, generateEmailDraft } from '@/lib/groq';

// Test endpoint to verify GROQ integration
export async function GET() {
  try {
    const session = await getSession();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test email
    const testEmail = {
      subject: 'Urgent: Project Deadline Change',
      from: 'client@company.com',
      body: 'Hi, we need to move the project deadline from Friday to Wednesday. Can you accommodate this change? Please confirm ASAP.',
    };

    // Test GROQ AI analysis
    const analysis = await analyzeEmail(testEmail.subject, testEmail.body, testEmail.from);
    const tasks = await extractTasks(`${testEmail.subject}\n\n${testEmail.body}`);
    const draft = await generateEmailDraft(
      `Subject: ${testEmail.subject}\nFrom: ${testEmail.from}\n\n${testEmail.body}`,
      'Acknowledge and confirm ability to meet new deadline',
      'professional'
    );

    return NextResponse.json({
      success: true,
      message: 'GROQ AI is working!',
      testEmail,
      analysis,
      tasks,
      draft,
    });

  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
