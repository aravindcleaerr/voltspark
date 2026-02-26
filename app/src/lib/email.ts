import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const FROM_EMAIL = process.env.EMAIL_FROM || 'VoltSpark <notifications@volt-spark.vercel.app>';

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!resend) {
    console.log('[Email] Resend not configured, skipping:', payload.subject);
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    return true;
  } catch (err) {
    console.error('[Email] Failed to send:', err);
    return false;
  }
}

// Pre-built email templates

export function notificationEmail(opts: {
  userName: string;
  notifications: { title: string; message: string; severity: string; actionUrl?: string }[];
  baseUrl: string;
}) {
  const severityColor: Record<string, string> = {
    CRITICAL: '#DC2626',
    WARNING: '#D97706',
    INFO: '#2563EB',
  };

  const items = opts.notifications.map(n => `
    <tr>
      <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
        <div style="display:flex;align-items:start;gap:8px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${severityColor[n.severity] || '#6B7280'};margin-top:6px;flex-shrink:0;"></span>
          <div>
            <p style="margin:0;font-weight:600;font-size:14px;color:#111827;">${n.title}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">${n.message}</p>
            ${n.actionUrl ? `<a href="${opts.baseUrl}${n.actionUrl}" style="color:#2563EB;font-size:12px;text-decoration:none;">View details →</a>` : ''}
          </div>
        </div>
      </td>
    </tr>
  `).join('');

  return {
    subject: `VoltSpark: ${opts.notifications.length} new alert${opts.notifications.length > 1 ? 's' : ''} require attention`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="text-align:center;padding:20px 0;">
            <h1 style="margin:0;font-size:24px;color:#111827;">VoltSpark</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Energy Management Alerts</p>
          </div>
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;overflow:hidden;">
            <div style="padding:16px;background:#f8fafc;border-bottom:1px solid #e5e7eb;">
              <p style="margin:0;font-size:14px;color:#374151;">Hi ${opts.userName},</p>
              <p style="margin:8px 0 0;font-size:13px;color:#6B7280;">You have ${opts.notifications.length} alert${opts.notifications.length > 1 ? 's' : ''} that need your attention:</p>
            </div>
            <table style="width:100%;border-collapse:collapse;">
              ${items}
            </table>
            <div style="padding:16px;text-align:center;">
              <a href="${opts.baseUrl}/notifications" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View All Notifications</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:20px;">
            Powered by VoltSpark — Energy Management Platform
          </p>
        </div>
      </body>
      </html>
    `,
  };
}

export function inviteEmail(opts: {
  inviterName: string;
  inviterOrg: string;
  clientName: string;
  role: string;
  loginUrl: string;
  tempPassword: string;
  email: string;
}) {
  return {
    subject: `You're invited to ${opts.clientName} on VoltSpark`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="text-align:center;padding:20px 0;">
            <h1 style="margin:0;font-size:24px;color:#111827;">VoltSpark</h1>
            <p style="margin:4px 0 0;font-size:13px;color:#6B7280;">Energy Management Platform</p>
          </div>
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;">
            <h2 style="margin:0 0 16px;font-size:18px;color:#111827;">You've been invited!</h2>
            <p style="font-size:14px;color:#374151;line-height:1.6;">
              <strong>${opts.inviterName}</strong> from <strong>${opts.inviterOrg}</strong> has invited you to collaborate on <strong>${opts.clientName}</strong> as a <strong>${opts.role}</strong>.
            </p>
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 8px;font-size:13px;color:#6B7280;">Your login credentials:</p>
              <p style="margin:0;font-size:14px;"><strong>Email:</strong> ${opts.email}</p>
              <p style="margin:4px 0 0;font-size:14px;"><strong>Password:</strong> ${opts.tempPassword}</p>
              <p style="margin:8px 0 0;font-size:12px;color:#D97706;">Please change your password after first login.</p>
            </div>
            <div style="text-align:center;margin-top:20px;">
              <a href="${opts.loginUrl}" style="display:inline-block;padding:12px 32px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">Login to VoltSpark</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:20px;">
            Powered by VoltSpark — Energy Management Platform
          </p>
        </div>
      </body>
      </html>
    `,
  };
}

export function reportEmail(opts: {
  recipientName: string;
  reportTitle: string;
  companyName: string;
  reportUrl: string;
  highlights: string[];
}) {
  const highlightItems = opts.highlights.map(h => `<li style="margin:4px 0;font-size:13px;color:#374151;">${h}</li>`).join('');

  return {
    subject: `${opts.reportTitle} — ${opts.companyName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
          <div style="text-align:center;padding:20px 0;">
            <h1 style="margin:0;font-size:24px;color:#111827;">VoltSpark</h1>
          </div>
          <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:24px;">
            <h2 style="margin:0 0 8px;font-size:18px;color:#111827;">${opts.reportTitle}</h2>
            <p style="margin:0 0 16px;font-size:13px;color:#6B7280;">${opts.companyName} — Generated ${new Date().toLocaleDateString()}</p>
            <p style="font-size:14px;color:#374151;">Hi ${opts.recipientName},</p>
            <p style="font-size:14px;color:#374151;line-height:1.6;">A new report has been generated. Here are the key highlights:</p>
            <ul style="padding-left:20px;">${highlightItems}</ul>
            <div style="text-align:center;margin-top:20px;">
              <a href="${opts.reportUrl}" style="display:inline-block;padding:10px 24px;background:#2563EB;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View Full Report</a>
            </div>
          </div>
          <p style="text-align:center;font-size:11px;color:#9CA3AF;margin-top:20px;">Powered by VoltSpark</p>
        </div>
      </body>
      </html>
    `,
  };
}
