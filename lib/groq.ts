// GROQ AI Service for Agent Intelligence
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

export interface EmailAnalysis {
  category: 'urgent' | 'client' | 'newsletter' | 'spam' | 'other';
  priority: 'high' | 'medium' | 'low';
  requiresAction: boolean;
  suggestedActions: string[];
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}

export interface TaskExtraction {
  tasks: Array<{
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: string;
    assignee?: string;
  }>;
  actionItems: string[];
}

export interface EmailDraft {
  subject: string;
  body: string;
  tone: 'professional' | 'casual' | 'formal';
  confidence: number;
}

// Analyze email content using GROQ AI
export async function analyzeEmail(
  subject: string,
  body: string,
  sender: string
): Promise<EmailAnalysis> {
  try {
    const prompt = `Analyze this email and provide a JSON response:

Subject: ${subject}
From: ${sender}
Body: ${body}

Provide analysis in this exact JSON format:
{
  "category": "urgent|client|newsletter|spam|other",
  "priority": "high|medium|low",
  "requiresAction": true|false,
  "suggestedActions": ["action1", "action2"],
  "summary": "brief summary",
  "sentiment": "positive|neutral|negative"
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert email analyst. Always respond with valid JSON only, no additional text.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile', // Using Llama 3.3 70B for reasoning
      temperature: 0.3,
      max_tokens: 500,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Email analysis error:', error);
    // Fallback analysis
    return {
      category: 'other',
      priority: 'medium',
      requiresAction: false,
      suggestedActions: [],
      summary: 'Unable to analyze email',
      sentiment: 'neutral',
    };
  }
}

// Extract tasks and action items from email
export async function extractTasks(emailContent: string): Promise<TaskExtraction> {
  try {
    const prompt = `Extract all tasks and action items from this email:

${emailContent}

Provide response in this exact JSON format:
{
  "tasks": [
    {
      "title": "task title",
      "description": "task description",
      "priority": "high|medium|low",
      "dueDate": "YYYY-MM-DD or null",
      "assignee": "person name or null"
    }
  ],
  "actionItems": ["action item 1", "action item 2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert at extracting tasks and action items. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.2,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '{"tasks":[],"actionItems":[]}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Task extraction error:', error);
    return { tasks: [], actionItems: [] };
  }
}

// Generate email draft response
export async function generateEmailDraft(
  originalEmail: string,
  context: string,
  tone: 'professional' | 'casual' | 'formal' = 'professional'
): Promise<EmailDraft> {
  try {
    const prompt = `Generate a ${tone} email response to this email:

Original Email:
${originalEmail}

Context/Instructions:
${context}

Provide response in this exact JSON format:
{
  "subject": "Re: original subject",
  "body": "email body text",
  "tone": "${tone}",
  "confidence": 0.95
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert email writer. Generate ${tone} email responses. Always respond with valid JSON only.`,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 800,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Email draft generation error:', error);
    return {
      subject: 'Re: Your email',
      body: 'Thank you for your email. I will review and respond shortly.',
      tone: 'professional',
      confidence: 0.5,
    };
  }
}

// Categorize and prioritize multiple emails
export async function batchAnalyzeEmails(
  emails: Array<{ subject: string; body: string; sender: string }>
): Promise<EmailAnalysis[]> {
  const analyses = await Promise.all(
    emails.map((email) => analyzeEmail(email.subject, email.body, email.sender))
  );
  return analyses;
}

// Generate agent decision for action
export async function agentDecision(
  situation: string,
  options: string[]
): Promise<{ decision: string; reasoning: string; confidence: number }> {
  try {
    const prompt = `Given this situation, decide the best action:

Situation: ${situation}

Options:
${options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}

Provide response in this exact JSON format:
{
  "decision": "chosen option",
  "reasoning": "why this option",
  "confidence": 0.95
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an AI agent decision maker. Analyze situations and make optimal decisions. Always respond with valid JSON only.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.4,
      max_tokens: 400,
    });

    const response = completion.choices[0]?.message?.content || '{}';
    return JSON.parse(response);
  } catch (error) {
    console.error('Agent decision error:', error);
    return {
      decision: options[0] || 'No action',
      reasoning: 'Unable to analyze situation',
      confidence: 0.5,
    };
  }
}

export default groq;
