import nodemailer from 'nodemailer';

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    },
    body: JSON.stringify(body)
  };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0);
}

function buildRows(items) {
  return items
    .map((item) => {
      const name = escapeHtml(item.name || 'Coffee Item');
      const orderType = escapeHtml(item.orderType || 'Standard');
      const quantity = Number(item.quantity || 1);
      const price = Number(item.price || 0);
      const lineTotal = quantity * price;

      return `
        <tr>
          <td style="padding: 14px 0; border-bottom: 1px solid #2a2f2b; color:#f2ece4; font-size:14px;">
            <div style="font-weight:600;">${name}</div>
            <div style="margin-top:4px; color:#c4bcae; font-size:12px; letter-spacing:0.04em; text-transform:uppercase;">${orderType}</div>
          </td>
          <td style="padding: 14px 0; border-bottom: 1px solid #2a2f2b; color:#c4bcae; font-size:13px; text-align:center;">${quantity}</td>
          <td style="padding: 14px 0; border-bottom: 1px solid #2a2f2b; color:#ddc073; font-size:14px; font-weight:600; text-align:right;">${formatCurrency(lineTotal)}</td>
        </tr>
      `;
    })
    .join('');
}

function buildEmailHtml({ customerName, orderId, placedAt, items, total }) {
  const safeName = escapeHtml(customerName);
  const safeOrderId = escapeHtml(orderId);
  const placedDate = new Date(placedAt);
  const formattedDate = Number.isNaN(placedDate.getTime())
    ? new Date().toLocaleString('en-IN')
    : placedDate.toLocaleString('en-IN');

  return `
<!doctype html>
<html>
  <body style="margin:0; padding:0; background:#080b09; font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#080b09; padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="width:680px; max-width:100%; background:#0f1411; border:1px solid #2b322d; border-radius:18px; overflow:hidden;">
            <tr>
              <td>
                <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1400&q=80" alt="Freshly brewed Araku coffee" width="680" style="display:block; width:100%; max-width:680px; height:auto;">
              </td>
            </tr>
            <tr>
              <td style="padding:30px 30px 12px;">
                <div style="color:#ddc073; letter-spacing:0.16em; font-size:11px; text-transform:uppercase;">Araku Coffee</div>
                <h1 style="margin:10px 0 0; color:#f2ece4; font-size:28px; line-height:1.2; font-family:Georgia,'Times New Roman',serif;">Your Order Is Confirmed</h1>
                <p style="margin:12px 0 0; color:#d4ccbf; font-size:15px; line-height:1.6;">Hi ${safeName}, your payment is successful and we have started preparing your order.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#131915; border:1px solid #2f372f; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Order ID</td>
                    <td style="padding:14px 16px; color:#f2ece4; font-size:13px; text-align:right;">${safeOrderId}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Placed At</td>
                    <td style="padding:0 16px 14px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(formattedDate)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 30px 8px;">
                <h2 style="margin:0; color:#f2ece4; font-size:18px;">Order Summary</h2>
              </td>
            </tr>
            <tr>
              <td style="padding:0 30px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <th style="padding:10px 0; color:#9e9588; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-align:left; border-bottom:1px solid #2a2f2b;">Item</th>
                    <th style="padding:10px 0; color:#9e9588; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-align:center; border-bottom:1px solid #2a2f2b; width:70px;">Qty</th>
                    <th style="padding:10px 0; color:#9e9588; font-size:11px; letter-spacing:0.1em; text-transform:uppercase; text-align:right; border-bottom:1px solid #2a2f2b; width:120px;">Amount</th>
                  </tr>
                  ${buildRows(items)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#121814; border:1px solid #2f372f; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Total Paid</td>
                    <td style="padding:14px 16px; color:#ddc073; font-size:20px; font-weight:700; text-align:right;">${formatCurrency(total)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px 34px;">
                <p style="margin:0; color:#d4ccbf; font-size:14px; line-height:1.7;">Thank you for choosing Araku. If you need help with this order, reply to this email and our team will assist you.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

function buildText({ customerName, orderId, placedAt, items, total }) {
  const lines = items.map((item) => {
    const quantity = Number(item.quantity || 1);
    const price = Number(item.price || 0);
    const lineTotal = quantity * price;
    return `- ${item.name} (${item.orderType || 'Standard'}) x${quantity}: ${formatCurrency(lineTotal)}`;
  });

  return [
    `Hi ${customerName},`,
    '',
    'Your payment was successful and your Araku order is confirmed.',
    `Order ID: ${orderId}`,
    `Placed At: ${new Date(placedAt).toLocaleString('en-IN')}`,
    '',
    'Items:',
    ...lines,
    '',
    `Total Paid: ${formatCurrency(total)}`,
    '',
    'Thank you for choosing Araku Coffee.'
  ].join('\n');
}

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { ok: false, message: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const customer = payload.customer || {};
    const items = Array.isArray(payload.items) ? payload.items : [];
    const total = Number(payload.total || 0);

    const customerName = String(customer.name || '').trim();
    const customerEmail = String(customer.email || '').trim();
    const customerPhone = String(customer.phone || '').trim();
    const orderId = String(payload.orderId || `ARK-${Date.now()}`);
    const placedAt = payload.placedAt || new Date().toISOString();

    const isValidEmail = /^\S+@\S+\.\S+$/.test(customerEmail);

    if (!customerName || !customerPhone || !isValidEmail || !items.length || total <= 0) {
      return response(400, { ok: false, message: 'Invalid checkout payload.' });
    }

    const mailUser = process.env.MAIL_USER;
    const mailAppPassword = process.env.MAIL_APP_PASSWORD;

    if (!mailUser || !mailAppPassword) {
      return response(500, {
        ok: false,
        message: 'Server email credentials are missing. Configure MAIL_USER and MAIL_APP_PASSWORD.'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: mailUser,
        pass: mailAppPassword
      }
    });

    const html = buildEmailHtml({
      customerName,
      orderId,
      placedAt,
      items,
      total
    });

    const text = buildText({
      customerName,
      orderId,
      placedAt,
      items,
      total
    });

    await transporter.sendMail({
      from: `Araku Coffee <${mailUser}>`,
      to: customerEmail,
      subject: `Your Araku Order ${orderId} is Confirmed`,
      html,
      text
    });

    return response(200, {
      ok: true,
      message: 'Order confirmation email sent successfully.'
    });
  } catch (error) {
    return response(500, {
      ok: false,
      message: 'Unable to send confirmation email right now.',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
