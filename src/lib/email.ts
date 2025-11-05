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
    case 'donation-refund':
      html = await renderDonationRefund(data);
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
    case 'application-confirmation':
      html = await renderApplicationConfirmation(data);
      break;
    case 'application-status-update':
      html = await renderApplicationStatusUpdate(data);
      break;
    case 'contact-confirmation':
      html = await renderContactConfirmation(data);
      break;
    case 'newsletter-welcome':
      html = await renderNewsletterWelcome(data);
      break;
    case 'partnership-confirmation':
      html = await renderPartnershipConfirmation(data);
      break;
    case 'partnership-status-update':
      html = await renderPartnershipStatusUpdate(data);
      break;
    case 'order-confirmation':
      html = await renderOrderConfirmation(data);
      break;
    case 'contact-response':
      html = await renderContactResponse(data);
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
    .receipt { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #dc2626; }
    .receipt-header { border-bottom: 2px solid #dc2626; padding-bottom: 10px; margin-bottom: 15px; }
    .receipt-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
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
        <div class="receipt-header">
          <h3>Donation Receipt</h3>
          <p><strong>Receipt Number:</strong> ${data.receiptNumber || 'N/A'}</p>
        </div>
        <div class="receipt-row">
          <span><strong>Organization:</strong></span>
          <span>${data.organizationName || 'Equality Vanguard'}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Amount:</strong></span>
          <span>${data.currency || '$'}${data.amount}</span>
        </div>
        <div class="receipt-row">
          <span><strong>Date:</strong></span>
          <span>${data.donationDate || new Date().toLocaleDateString()}</span>
        </div>
        ${data.taxDeductible ? `<div class="receipt-row"><span><strong>Tax Deductible:</strong></span><span>Yes</span></div>` : ''}
        ${data.organizationTaxId ? `<div class="receipt-row"><span><strong>Tax ID:</strong></span><span>${data.organizationTaxId}</span></div>` : ''}
      </div>
      <p>Your contribution helps us continue our mission of building a more equitable future.</p>
      <p>This receipt serves as confirmation of your donation for tax purposes.</p>
      <p>Best regards,<br>The Equality Vanguard Team</p>
    </div>
    <div class="footer">
      <p>${data.organizationAddress || 'Equality Vanguard'} | Building a more equitable future</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

async function renderDonationRefund(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Donation Refund Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #fffbeb; }
    .refund-details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #f59e0b; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Donation Refund Confirmation</h1>
    </div>
    <div class="content">
      <p>Dear ${data.donorName},</p>
      <p>This email confirms that your donation refund has been processed.</p>
      <div class="refund-details">
        <h3>Refund Details</h3>
        <p><strong>Original Amount:</strong> ${data.currency || '$'}${data.amount}</p>
        <p><strong>Refund ID:</strong> ${data.refundId}</p>
        <p><strong>Refund Date:</strong> ${data.refundDate}</p>
        <p><strong>Status:</strong> Processed</p>
      </div>
      <p>The refund will appear in your account within 5-10 business days, depending on your payment method.</p>
      <p>If you have any questions, please contact us at ${process.env.ADMIN_EMAIL || 'support@equalityvanguard.org'}</p>
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

async function renderApplicationConfirmation(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Received</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .application-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Application Received!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.applicantName},</p>
      <p>Thank you for your interest in joining Equality Vanguard!</p>
      <div class="application-details">
        <h3>Application Details</h3>
        <p><strong>Position:</strong> ${data.jobTitle}</p>
        <p><strong>Application Date:</strong> ${data.applicationDate}</p>
        <p><strong>Status:</strong> Under Review</p>
      </div>
      <p>We have received your application and our team will review it carefully. We will get back to you as soon as possible.</p>
      <p>If you have any questions, please don't hesitate to contact us.</p>
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

async function renderApplicationStatusUpdate(data: any): Promise<string> {
  const statusMessages: Record<string, { title: string; color: string; bgColor: string; message: string }> = {
    shortlisted: {
      title: 'Congratulations! You\'ve Been Shortlisted',
      color: '#059669',
      bgColor: '#f0fdf4',
      message: 'We are pleased to inform you that your application has been shortlisted for the next stage of the selection process.'
    },
    accepted: {
      title: 'Congratulations! You\'ve Been Accepted',
      color: '#059669',
      bgColor: '#f0fdf4',
      message: 'We are delighted to offer you the position! We believe you would be a valuable addition to our team.'
    },
    rejected: {
      title: 'Application Update',
      color: '#dc2626',
      bgColor: '#fef2f2',
      message: 'Thank you for your interest in Equality Vanguard. Unfortunately, we are not able to move forward with your application at this time.'
    }
  };

  const statusInfo = statusMessages[data.status] || {
    title: 'Application Status Update',
    color: '#4f46e5',
    bgColor: '#f9fafb',
    message: 'Your application status has been updated.'
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Application Status Update</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: ${statusInfo.color}; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: ${statusInfo.bgColor}; }
    .status-details { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border: 2px solid ${statusInfo.color}; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${statusInfo.title}</h1>
    </div>
    <div class="content">
      <p>Dear ${data.applicantName},</p>
      <p>${statusInfo.message}</p>
      <div class="status-details">
        <h3>Application Details</h3>
        <p><strong>Position:</strong> ${data.jobTitle}</p>
        <p><strong>Status:</strong> ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}</p>
        ${data.interviewDate ? `<p><strong>Interview Date:</strong> ${data.interviewDate}</p>` : ''}
        ${data.reviewNotes ? `<p><strong>Notes:</strong><br>${data.reviewNotes}</p>` : ''}
      </div>
      ${data.status === 'accepted' ? '<p>We will be in touch soon with next steps and onboarding information.</p>' : ''}
      ${data.status === 'shortlisted' ? '<p>We will contact you soon to schedule the next steps in the process.</p>' : ''}
      ${data.status === 'rejected' ? '<p>We appreciate your interest in Equality Vanguard and wish you the best in your future endeavors.</p>' : ''}
      <p>If you have any questions, please don't hesitate to contact us.</p>
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

async function renderOrderConfirmation(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #059669; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f0fdf4; }
    .order-details { background: white; padding: 20px; border-radius: 8px; margin: 15px 0; border: 2px solid #059669; }
    .order-header { border-bottom: 2px solid #059669; padding-bottom: 10px; margin-bottom: 15px; }
    .order-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .order-items { margin-top: 15px; }
    .order-item { padding: 8px 0; border-bottom: 1px solid #eee; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Dear ${data.customerName},</p>
      <p>Thank you for your order! We've received your payment and your order is being processed.</p>
      <div class="order-details">
        <div class="order-header">
          <h3>Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
        </div>
        <div class="order-items">
          <h4>Items:</h4>
          ${data.items.map((item: any) => `
            <div class="order-item">
              <div><strong>${item.name}</strong> x ${item.quantity}</div>
              <div>${data.currency || '$'}${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
        </div>
        <div class="order-row">
          <span><strong>Subtotal:</strong></span>
          <span>${data.currency || '$'}${data.subtotal.toFixed(2)}</span>
        </div>
        ${data.shipping > 0 ? `
        <div class="order-row">
          <span><strong>Shipping:</strong></span>
          <span>${data.currency || '$'}${data.shipping.toFixed(2)}</span>
        </div>
        ` : ''}
        ${data.tax > 0 ? `
        <div class="order-row">
          <span><strong>Tax:</strong></span>
          <span>${data.currency || '$'}${data.tax.toFixed(2)}</span>
        </div>
        ` : ''}
        <div class="order-row" style="border-top: 2px solid #059669; margin-top: 10px; padding-top: 10px; font-size: 1.1em;">
          <span><strong>Total:</strong></span>
          <span><strong>${data.currency || '$'}${data.total.toFixed(2)}</strong></span>
        </div>
      </div>
      ${data.shippingAddress ? `
      <div class="order-details">
        <h4>Shipping Address:</h4>
        <p>${data.shippingAddress}</p>
      </div>
      ` : ''}
      <p>We'll send you a shipping confirmation email once your order has been shipped.</p>
      <p>If you have any questions, please contact us at ${process.env.ADMIN_EMAIL || 'support@equalityvanguard.org'}</p>
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

async function renderContactResponse(data: any): Promise<string> {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Response to Your Inquiry</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .message-box { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #4f46e5; }
    .original-message { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Response to Your Inquiry</h1>
    </div>
    <div class="content">
      <p>Dear ${data.name},</p>
      <p>Thank you for contacting Equality Vanguard. We have received your inquiry regarding "${data.subject}" and here is our response:</p>
      <div class="message-box">
        <p>${data.response}</p>
      </div>
      <div class="original-message">
        <p><strong>Your original message:</strong></p>
        <p>${data.originalMessage}</p>
      </div>
      <p>If you have any further questions, please don't hesitate to contact us again.</p>
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
