// Gmail API Integration with OAuth 2.0
import { google } from 'googleapis';

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  snippet: string;
  date: string;
  labels: string[];
  isUnread: boolean;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

// Initialize Gmail API client
export function getGmailClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  oauth2Client.setCredentials({ access_token: accessToken });

  return google.gmail({ version: 'v1', auth: oauth2Client });
}

// Read emails from Gmail
export async function readEmails(
  accessToken: string,
  maxResults: number = 10,
  query: string = 'is:unread'
): Promise<GmailMessage[]> {
  try {
    const gmail = getGmailClient(accessToken);

    // List messages
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
      q: query,
    });

    const messages = response.data.messages || [];
    const emailDetails: GmailMessage[] = [];

    // Fetch full details for each message
    for (const message of messages) {
      if (!message.id) continue;

      const details = await gmail.users.messages.get({
        userId: 'me',
        id: message.id,
        format: 'full',
      });

      const headers = details.data.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers.find(h => h.name === 'From')?.value || 'Unknown';
      const to = headers.find(h => h.name === 'To')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Extract body
      let body = '';
      if (details.data.payload?.parts) {
        const textPart = details.data.payload.parts.find(
          part => part.mimeType === 'text/plain'
        );
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString('utf-8');
        }
      } else if (details.data.payload?.body?.data) {
        body = Buffer.from(details.data.payload.body.data, 'base64').toString('utf-8');
      }

      emailDetails.push({
        id: message.id,
        threadId: details.data.threadId || '',
        subject,
        from,
        to,
        body,
        snippet: details.data.snippet || '',
        date,
        labels: details.data.labelIds || [],
        isUnread: details.data.labelIds?.includes('UNREAD') || false,
      });
    }

    return emailDetails;
  } catch (error) {
    console.error('Error reading emails:', error);
    throw new Error('Failed to read emails from Gmail');
  }
}

// Send email via Gmail
export async function sendEmail(
  accessToken: string,
  params: SendEmailParams
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const gmail = getGmailClient(accessToken);

    // Create email message
    const message = [
      `To: ${params.to}`,
      params.cc ? `Cc: ${params.cc}` : '',
      params.bcc ? `Bcc: ${params.bcc}` : '',
      `Subject: ${params.subject}`,
      '',
      params.body,
    ]
      .filter(line => line !== '')
      .join('\n');

    // Encode message
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    // Send email
    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    return {
      success: true,
      messageId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email via Gmail');
  }
}

// Mark email as read
export async function markAsRead(
  accessToken: string,
  messageId: string
): Promise<boolean> {
  try {
    const gmail = getGmailClient(accessToken);

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        removeLabelIds: ['UNREAD'],
      },
    });

    return true;
  } catch (error) {
    console.error('Error marking email as read:', error);
    return false;
  }
}

// Add label to email
export async function addLabel(
  accessToken: string,
  messageId: string,
  labelName: string
): Promise<boolean> {
  try {
    const gmail = getGmailClient(accessToken);

    // Get or create label
    const labelsResponse = await gmail.users.labels.list({ userId: 'me' });
    let labelId = labelsResponse.data.labels?.find(l => l.name === labelName)?.id;

    if (!labelId) {
      // Create label if it doesn't exist
      const createResponse = await gmail.users.labels.create({
        userId: 'me',
        requestBody: {
          name: labelName,
          labelListVisibility: 'labelShow',
          messageListVisibility: 'show',
        },
      });
      labelId = createResponse.data.id;
    }

    if (!labelId) return false;

    // Add label to message
    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });

    return true;
  } catch (error) {
    console.error('Error adding label:', error);
    return false;
  }
}

// Reply to email
export async function replyToEmail(
  accessToken: string,
  originalMessageId: string,
  replyBody: string
): Promise<{ success: boolean; messageId?: string }> {
  try {
    const gmail = getGmailClient(accessToken);

    // Get original message
    const original = await gmail.users.messages.get({
      userId: 'me',
      id: originalMessageId,
      format: 'full',
    });

    const headers = original.data.payload?.headers || [];
    const subject = headers.find(h => h.name === 'Subject')?.value || '';
    const to = headers.find(h => h.name === 'From')?.value || '';
    const messageId = headers.find(h => h.name === 'Message-ID')?.value || '';
    const references = headers.find(h => h.name === 'References')?.value || '';

    // Create reply
    const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
    const message = [
      `To: ${to}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageId}`,
      `References: ${references} ${messageId}`,
      '',
      replyBody,
    ].join('\n');

    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: original.data.threadId,
      },
    });

    return {
      success: true,
      messageId: response.data.id || undefined,
    };
  } catch (error) {
    console.error('Error replying to email:', error);
    throw new Error('Failed to reply to email');
  }
}

// Get OAuth URL for Gmail
export function getGmailAuthUrl(): string {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.labels',
  ];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

// Exchange code for tokens
export async function getGmailTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}
