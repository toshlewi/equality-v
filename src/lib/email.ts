import Mailgun from 'mailgun.js';
import FormData from 'form-data';

// Initialize Mailgun client
const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: 'api',
  key: process.env.MAILGUN_API_KEY!,
  url: 'https://api.mailgun.net'
});

export interface EmailData {
  to: string | string[];
  subject: string;
  template: string;
  data: Record<string, any>;
  attachments?: Array<{
    filename: string;
    data: Buffer | string;
    contentType?: string;
  }>;
}

export interface BulkEmailData {
  recipients: Array<{
    email: string;
    name?: string;
    data?: Record<string, any>;
  }>;
  subject: string;
  template: string;
  data: Record<string, any>;
}

/**
 * Send a single email
 */
export async function sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { to, subject, template, data, attachments } = emailData;
    
    // Render email template
    const html = await renderEmailTemplate(template, data);
    const text = await renderTextTemplate(template, data);

    const emailOptions: any = {
      from: `${process.env.MAILGUN_FROM_NAME} <${process.env.MAILGUN_FROM_EMAIL}>`,
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html,
      text
    };

    if (attachments && attachments.length > 0) {
      emailOptions.attachment = attachments.map(att => ({
        filename: att.filename,
        data: att.data,
        contentType: att.contentType
      }));
    }

    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN!, emailOptions);
    
    return {
      success: true,
      messageId: response.id
    };
  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Send bulk emails
 */
export async function sendBulkEmails(bulkData: BulkEmailData): Promise<{ success: boolean; results: any[]; errors: any[] }> {
  try {
    const { recipients, subject, template, data } = bulkData;
    const results = [];
    const errors = [];

    // Process in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (recipient) => {
        try {
          const emailData = {
            to: recipient.email,
            subject,
            template,
            data: { ...data, ...recipient.data }
          };
          
          const result = await sendEmail(emailData);
          return { recipient: recipient.email, ...result };
        } catch (error) {
          return { 
            recipient: recipient.email, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Add delay between batches
      if (i + batchSize < recipients.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return {
      success: failed.length === 0,
      results: successful,
      errors: failed
    };
  } catch (error) {
    console.error('Error sending bulk emails:', error);
    return {
      success: false,
      results: [],
      errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

/**
 * Track email delivery
 */
export async function trackDelivery(messageId: string): Promise<any> {
  try {
    const response = await mg.events.get(process.env.MAILGUN_DOMAIN!, {
      messageId
    });
    return response;
  } catch (error) {
    console.error('Error tracking email delivery:', error);
    return null;
  }
}

/**
 * Handle bounced emails
 */
export async function handleBounce(email: string): Promise<void> {
  try {
    // Add to bounce list or update user status
    console.log('Handling bounced email:', email);
    
    // TODO: Update user status in database
    // TODO: Remove from active mailing lists
    // TODO: Log bounce event
  } catch (error) {
    console.error('Error handling bounce:', error);
  }
}

/**
 * Render email template
 */
async function renderEmailTemplate(template: string, data: Record<string, any>): Promise<string> {
  // In a real implementation, you would use a template engine like Handlebars or EJS
  // For now, we'll do simple string replacement
  
  let html = '';
  
  switch (template) {
    case 'membership-confirmation':
      html = await renderMembershipConfirmation(data);
      break;
    case 'event-registration':
      html = await renderEventRegistration(data);
      break;
    case 'donation-receipt':
      html = await renderDonationReceipt(data);
      break;
    case 'submission-received':
      html = await renderSubmissionReceived(data);
      break;
    case 'submission-approved':
      html = await renderSubmissionApproved(data);
      break;
    case 'submission-rejected':
      html = await renderSubmissionRejected(data);
      break;
    case 'admin-notification':
      html = await renderAdminNotification(data);
      break;
    case 'password-reset':
      html = await renderPasswordReset(data);
      break;
    default:
      html = await renderDefaultTemplate(template, data);
  }
  
  return html;
}

/**
 * Render text template
 */
async function renderTextTemplate(template: string, data: Record<string, any>): Promise<string> {
  // Convert HTML to text (simplified)
  const html = await renderEmailTemplate(template, data);
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Template renderers
async function renderMembershipConfirmation(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Membership Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Equality Vanguard!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.name},</p>
      <p>Thank you for joining Equality Vanguard as a ${data.membershipType} member!</p>
      <p><strong>Membership Details:</strong></p>
      <ul>
        <li>Type: ${data.membershipType}</li>
        <li>Amount: $${data.amount}</li>
        <li>Start Date: ${data.startDate}</li>
        <li>End Date: ${data.endDate}</li>
      </ul>
      <p>Your membership is now active and you have access to all member benefits.</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderEventRegistration(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Event Registration Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f0fdf4; }
    .event-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Event Registration Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.name},</p>
      <p>Your registration for the following event has been confirmed:</p>
      <div class="event-details">
        <h3>${data.eventTitle}</h3>
        <p><strong>Date:</strong> ${data.eventDate}</p>
        <p><strong>Time:</strong> ${data.eventTime}</p>
        <p><strong>Location:</strong> ${data.eventLocation}</p>
        <p><strong>Ticket Type:</strong> ${data.ticketType}</p>
        <p><strong>Amount Paid:</strong> $${data.amount}</p>
      </div>
      <p>We look forward to seeing you at the event!</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderDonationReceipt(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Donation Receipt</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fef2f2; }
    .receipt { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Thank You for Your Donation!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.donorName},</p>
      <p>Thank you for your generous donation to Equality Vanguard!</p>
      <div class="receipt">
        <h3>Donation Receipt</h3>
        <p><strong>Amount:</strong> $${data.amount}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
      </div>
      <p>Your contribution helps us continue our mission of building a more equitable future.</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderSubmissionReceived(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Submission Received</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #7c3aed; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #faf5ff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Submission Received</h1>
    </div>
    <div class="content">
      <p>Dear ${data.submitterName},</p>
      <p>Thank you for your submission to Equality Vanguard!</p>
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Type: ${data.submissionType}</li>
        <li>Title: ${data.title}</li>
        <li>Date Submitted: ${data.submissionDate}</li>
      </ul>
      <p>We have received your submission and it is currently under review. We will notify you once the review process is complete.</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderSubmissionApproved(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Submission Approved</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f0fdf4; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Submission Approved!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.submitterName},</p>
      <p>Great news! Your submission has been approved and is now live on our platform.</p>
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Type: ${data.submissionType}</li>
        <li>Title: ${data.title}</li>
        <li>Approved Date: ${data.approvedDate}</li>
      </ul>
      <p>Thank you for contributing to our community!</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderSubmissionRejected(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Submission Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #dc2626; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fef2f2; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Submission Update</h1>
    </div>
    <div class="content">
      <p>Dear ${data.submitterName},</p>
      <p>Thank you for your submission to Equality Vanguard. After careful review, we have decided not to publish this content at this time.</p>
      <p><strong>Submission Details:</strong></p>
      <ul>
        <li>Type: ${data.submissionType}</li>
        <li>Title: ${data.title}</li>
        <li>Review Date: ${data.reviewDate}</li>
      </ul>
      <p><strong>Feedback:</strong></p>
      <p>${data.feedback || 'Please review our content guidelines and consider submitting again in the future.'}</p>
      <p>We encourage you to continue contributing to our community!</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderAdminNotification(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Admin Notification</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fffbeb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Admin Notification</h1>
    </div>
    <div class="content">
      <p><strong>${data.title}</strong></p>
      <p>${data.message}</p>
      <p><strong>Details:</strong></p>
      <ul>
        <li>Type: ${data.type}</li>
        <li>Priority: ${data.priority}</li>
        <li>Time: ${data.timestamp}</li>
      </ul>
      <p>Please log in to the admin dashboard to take action.</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard Admin System</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderPasswordReset(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Password Reset</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #6366f1; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f8fafc; }
    .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="content">
      <p>Dear ${data.name},</p>
      <p>You have requested to reset your password for your Equality Vanguard admin account.</p>
      <p>Click the button below to reset your password:</p>
      <a href="${data.resetUrl}" class="button">Reset Password</a>
      <p>This link will expire in 24 hours.</p>
      <p>If you did not request this password reset, please ignore this email.</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderDefaultTemplate(template: string, data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Email from Equality Vanguard</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Equality Vanguard</h1>
    </div>
    <div class="content">
      <p>Template: ${template}</p>
      <p>Data: ${JSON.stringify(data, null, 2)}</p>
    </div>
    <div class="footer">
      <p>Equality Vanguard | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Password reset email function
export async function sendPasswordResetEmail(email: string, resetUrl: string, name: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  return sendEmail({
    to: email,
    subject: 'Password Reset - Equality Vanguard',
    template: 'password-reset',
    data: {
      name,
      resetUrl
    }
  });
}

export default {
  sendEmail,
  sendBulkEmails,
  trackDelivery,
  handleBounce,
  sendPasswordResetEmail
};
