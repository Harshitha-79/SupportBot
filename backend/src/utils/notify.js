import nodemailer from "nodemailer";
import { 
  getApprovalEmailTemplate, 
  getPendingApprovalEmailTemplate,
  getStaffMessageTemplate 
} from './emailTemplates.js';

const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

// Create reusable transporter - prefer Gmail if configured, fallback to SMTP
const createTransporter = () => {
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });
  }

  // Fallback to regular SMTP if Gmail not configured
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587,
      secure: false,
      auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      } : undefined,
    });
  }

  return null;
};

const transporter = createTransporter();

// Verify email configuration on startup
if (transporter) {
  transporter.verify((error, success) => {
    if (error) {
      console.error('Email configuration error:', error);
    } else {
      console.log('Email server is ready to send messages');
    }
  });
}

const sendSlack = async (webhook, message) => {
  try {
    await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });
    console.log('Slack notification sent');
    return true;
  } catch (err) {
    console.error('Slack notify failed:', err.message);
    return false;
  }
};

const sendEmail = async ({ to, template, data }) => {
  if (!transporter) {
    throw new Error('Email not configured');
  }

  try {
    // Get the email template
    let emailContent;
    switch (template) {
      case 'approval':
        emailContent = getApprovalEmailTemplate(data);
        break;
      case 'pending-approval':
        emailContent = getPendingApprovalEmailTemplate(data);
        break;
      case 'staff-message':
        emailContent = getStaffMessageTemplate(data);
        break;
      default:
        // Fallback for simple messages
        emailContent = {
          subject: 'IT Support Notification',
          text: typeof data === 'string' ? data : data.message,
          html: typeof data === 'string' ? `<p>${data}</p>` : `<p>${data.message}</p>`
        };
    }

    // Send mail
    const info = await transporter.sendMail({
      from: process.env.GMAIL_USER || process.env.SMTP_FROM || 'no-reply@example.com',
      to,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    console.log('Email sent to:', to, 'MessageId:', info.messageId);
    return true;
  } catch (err) {
    console.error('Email notify failed:', err.message);
    return false;
  }
};

export const sendNotification = async (params) => {
  let success = false;

  // Handle legacy format (to, message)
  if (typeof params === 'string' || (params && !params.template)) {
    const to = typeof params === 'string' ? arguments[0] : params.to;
    const message = typeof params === 'string' ? arguments[1] : params.message;
    params = { to, template: 'simple', data: message };
  }

  // Try Slack first if webhook configured and it's not a template-based notification
  if (SLACK_WEBHOOK && !params.template) {
    success = await sendSlack(SLACK_WEBHOOK, params.data);
  }

  // Try email if recipient provided and looks like an email
  if (params.to && params.to.includes('@')) {
    success = await sendEmail(params);
  }

  // Fallback to console if nothing else worked
  if (!success) {
    const message = params.data?.message || params.data || 'No message content';
    console.log(`📣 Notification (log): ${params.to} — ${message}`);
  }

  return { success };
};
