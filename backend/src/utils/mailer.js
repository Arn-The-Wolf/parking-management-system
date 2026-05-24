const nodemailer = require('nodemailer');
const logger = require('./logger');

// ── Transporter ───────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify connection on startup (non-fatal)
transporter.verify((error) => {
  if (error) {
    logger.warn(`Email service not configured: ${error.message}`);
  } else {
    logger.info('✅ Email service ready');
  }
});

// ── Shared layout wrapper ─────────────────────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#6366f1);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:white;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
                🚗 XWZ Parking Management
              </h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.75);font-size:13px;">
                Kigali, Rwanda
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">
                © 2024 XWZ Parking Management System &mdash; Kigali, Rwanda<br/>
                This is an automated email, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ── Helper: send mail safely (never crashes the app) ─────────────────────────
const sendMail = async ({ to, subject, html }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    logger.warn('Email not sent — EMAIL_USER or EMAIL_PASS not set in .env');
    return;
  }
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `XWZ Parking <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to ${to} — ${info.messageId}`);
  } catch (error) {
    logger.error(`Email failed to ${to}: ${error.message}`);
  }
};

// ── 1. Welcome email (sent on registration) ───────────────────────────────────
const sendWelcomeEmail = async ({ firstName, lastName, email, role }) => {
  const roleLabel = role === 'admin' ? 'Administrator' : 'Parking Attendant';

  const html = layout(`
    <h2 style="margin:0 0 8px;color:#1f2937;font-size:22px;">
      Welcome, ${firstName}! 👋
    </h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:15px;">
      Your account has been created successfully on the XWZ Parking Management System.
    </p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;margin-bottom:24px;border-left:4px solid #4f46e5;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Full Name:</strong> ${firstName} ${lastName}
      </p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Email:</strong> ${email}
      </p>
      <p style="margin:0;color:#374151;font-size:14px;">
        <strong>Role:</strong> ${roleLabel}
      </p>
    </div>

    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;line-height:1.6;">
      You can now log in to the system to manage parking operations,
      register vehicle entries and exits, and generate reports.
    </p>

    <div style="text-align:center;margin:28px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login"
         style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#6366f1);
                color:white;padding:14px 36px;border-radius:8px;text-decoration:none;
                font-weight:700;font-size:15px;letter-spacing:0.3px;">
        Login to System →
      </a>
    </div>

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
      If you did not create this account, please contact your administrator.
    </p>
  `);

  await sendMail({
    to: email,
    subject: '🚗 Welcome to XWZ Parking Management System',
    html,
  });
};

// ── 2. Bill / receipt email (sent on car exit) ────────────────────────────────
const sendBillEmail = async ({ email, bill }) => {
  const total = parseFloat(bill.totalCharged).toLocaleString();
  const rate  = parseFloat(bill.chargingFeePerHour).toLocaleString();

  const row = (label, value, highlight = false) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:11px 0;color:#6b7280;font-size:14px;">${label}</td>
      <td style="padding:11px 0;text-align:right;font-weight:600;font-size:14px;
                 color:${highlight ? '#10b981' : '#1f2937'};">
        ${value}
      </td>
    </tr>
  `;

  const html = layout(`
    <h2 style="margin:0 0 4px;color:#1f2937;font-size:22px;">Parking Receipt 🧾</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      Here is the bill for vehicle <strong>${bill.plateNumber}</strong>.
    </p>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="border-top:1px solid #f3f4f6;margin-bottom:8px;">
      ${row('Plate Number',  bill.plateNumber)}
      ${row('Parking',       bill.parkingName)}
      ${row('Location',      bill.location)}
      ${row('Entry Time',    bill.entryDateTime)}
      ${row('Exit Time',     bill.exitDateTime)}
      ${row('Duration',      `${bill.duration} (${bill.durationHours} hrs)`)}
      ${row('Rate',          `RWF ${rate} / hr`)}
      <tr>
        <td style="padding:16px 0 4px;color:#1f2937;font-weight:700;font-size:16px;">
          TOTAL CHARGED
        </td>
        <td style="padding:16px 0 4px;text-align:right;font-weight:800;
                   font-size:22px;color:#10b981;">
          RWF ${total}
        </td>
      </tr>
    </table>

    <div style="background:#f0fdf4;border-radius:8px;padding:14px 18px;
                margin-top:20px;border-left:4px solid #10b981;">
      <p style="margin:0;color:#065f46;font-size:13px;">
        ✅ Payment confirmed. Thank you for using XWZ Parking!
      </p>
    </div>

    <p style="margin:24px 0 0;color:#9ca3af;font-size:13px;text-align:center;">
      Drive safely and see you next time 🚗
    </p>
  `);

  await sendMail({
    to: email,
    subject: `🧾 Parking Bill — ${bill.plateNumber} — RWF ${total}`,
    html,
  });
};

// ── 3. New car entry notification (sent to attendant) ─────────────────────────
const sendEntryEmail = async ({ email, ticket }) => {
  const fee = parseFloat(ticket.chargingFeePerHour).toLocaleString();

  const html = layout(`
    <h2 style="margin:0 0 4px;color:#1f2937;font-size:22px;">Car Entry Registered 🎫</h2>
    <p style="margin:0 0 24px;color:#6b7280;font-size:14px;">
      A new vehicle has been registered at <strong>${ticket.parkingName}</strong>.
    </p>

    <div style="background:#f9fafb;border-radius:8px;padding:20px;
                margin-bottom:24px;border-left:4px solid #f59e0b;">
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Plate Number:</strong> ${ticket.plateNumber}
      </p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Parking:</strong> ${ticket.parkingName} (${ticket.parkingCode})
      </p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Location:</strong> ${ticket.location}
      </p>
      <p style="margin:0 0 8px;color:#374151;font-size:14px;">
        <strong>Entry Time:</strong> ${ticket.entryDateTime}
      </p>
      <p style="margin:0;color:#374151;font-size:14px;">
        <strong>Rate:</strong> RWF ${fee} / hour
      </p>
    </div>

    <p style="margin:0;color:#6b7280;font-size:13px;">
      Ticket ID: <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px;">
        ${ticket.ticketId?.slice(0, 8).toUpperCase()}
      </code>
    </p>
  `);

  await sendMail({
    to: email,
    subject: `🎫 Car Entry — ${ticket.plateNumber} at ${ticket.parkingCode}`,
    html,
  });
};

module.exports = { sendWelcomeEmail, sendBillEmail, sendEntryEmail };
