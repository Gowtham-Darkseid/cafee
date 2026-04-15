import nodemailer from 'nodemailer';

function makeError(message, statusCode) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
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

function normalizePayload(payload) {
  const safePayload = payload && typeof payload === 'object' ? payload : {};
  const customer = safePayload.customer && typeof safePayload.customer === 'object' ? safePayload.customer : {};
  const reservation = safePayload.reservation && typeof safePayload.reservation === 'object' ? safePayload.reservation : {};
  const preorders = Array.isArray(safePayload.preorders) ? safePayload.preorders : [];

  const customerName = String(customer.name || '').trim();
  const customerEmail = String(customer.email || '').trim();
  const customerPhone = String(customer.phone || '').trim();

  const table = String(reservation.table || '').trim();
  const date = String(reservation.date || '').trim();
  const guests = Number(reservation.guests || 0);
  const timeIn = String(reservation.timeIn || '').trim();
  const timeOut = String(reservation.timeOut || '').trim();

  const bookingId = String(safePayload.bookingId || `ARK-RSV-${Date.now()}`);
  const placedAt = safePayload.placedAt || new Date().toISOString();

  const normalizedPreorders = preorders
    .map((item) => ({
      name: String(item.name || '').trim(),
      quantity: Number(item.quantity || 1),
      price: Number(item.price || 0)
    }))
    .filter((item) => item.name && item.quantity > 0 && item.price >= 0);

  const totalPreorder = Number(
    safePayload.totalPreorder || normalizedPreorders.reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  if (!customerName || !customerPhone || !customerEmail) {
    throw makeError('Missing customer details.', 400);
  }

  if (!/^\S+@\S+\.\S+$/.test(customerEmail)) {
    throw makeError('Invalid email address.', 400);
  }

  if (!table || !date || !timeIn || !timeOut || guests <= 0) {
    throw makeError('Missing reservation details.', 400);
  }

  return {
    bookingId,
    placedAt,
    customer: {
      name: customerName,
      email: customerEmail,
      phone: customerPhone
    },
    reservation: {
      table,
      date,
      guests,
      timeIn,
      timeOut
    },
    preorders: normalizedPreorders,
    totalPreorder
  };
}

function buildPreorderRows(preorders) {
  if (!preorders.length) {
    return `
      <tr>
        <td colspan="3" style="padding: 16px; color:#bfb7a9; font-size:13px; text-align:center; border:1px dashed #303631; border-radius:8px;">
          No pre-order selected.
        </td>
      </tr>
    `;
  }

  return preorders.map((item) => {
    const lineTotal = item.price * item.quantity;
    return `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2f2b; color:#f2ece4; font-size:14px;">${escapeHtml(item.name)}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2f2b; color:#c4bcae; font-size:13px; text-align:center;">${item.quantity}</td>
        <td style="padding: 12px 0; border-bottom: 1px solid #2a2f2b; color:#ddc073; font-size:14px; font-weight:600; text-align:right;">${formatCurrency(lineTotal)}</td>
      </tr>
    `;
  }).join('');
}

function buildHtmlEmail(data) {
  const placedDate = new Date(data.placedAt);
  const friendlyPlacedAt = Number.isNaN(placedDate.getTime())
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
                <img src="https://images.unsplash.com/photo-1445116572660-236099ec97a0?auto=format&fit=crop&w=1400&q=80" alt="Araku table reservation" width="680" style="display:block; width:100%; max-width:680px; height:auto;">
              </td>
            </tr>
            <tr>
              <td style="padding:30px 30px 12px;">
                <div style="color:#ddc073; letter-spacing:0.16em; font-size:11px; text-transform:uppercase;">Araku Reserve</div>
                <h1 style="margin:10px 0 0; color:#f2ece4; font-size:28px; line-height:1.2; font-family:Georgia,'Times New Roman',serif;">Your Table Is Confirmed</h1>
                <p style="margin:12px 0 0; color:#d4ccbf; font-size:15px; line-height:1.6;">Hi ${escapeHtml(data.customer.name)}, your reservation is booked and synced successfully.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#131915; border:1px solid #2f372f; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Booking ID</td>
                    <td style="padding:14px 16px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(data.bookingId)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Booked At</td>
                    <td style="padding:0 16px 14px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(friendlyPlacedAt)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#121814; border:1px solid #2f372f; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Table</td>
                    <td style="padding:14px 16px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(data.reservation.table)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Date</td>
                    <td style="padding:0 16px 14px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(data.reservation.date)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Time</td>
                    <td style="padding:0 16px 14px; color:#f2ece4; font-size:13px; text-align:right;">${escapeHtml(data.reservation.timeIn)} - ${escapeHtml(data.reservation.timeOut)}</td>
                  </tr>
                  <tr>
                    <td style="padding:0 16px 14px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Guests</td>
                    <td style="padding:0 16px 14px; color:#f2ece4; font-size:13px; text-align:right;">${data.reservation.guests}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 30px 8px;">
                <h2 style="margin:0; color:#f2ece4; font-size:18px;">Pre-order Summary</h2>
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
                  ${buildPreorderRows(data.preorders)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 30px 0;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#121814; border:1px solid #2f372f; border-radius:12px;">
                  <tr>
                    <td style="padding:14px 16px; color:#b6ad9f; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">Pre-order Total</td>
                    <td style="padding:14px 16px; color:#ddc073; font-size:20px; font-weight:700; text-align:right;">${formatCurrency(data.totalPreorder)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 30px 34px;">
                <p style="margin:0; color:#d4ccbf; font-size:14px; line-height:1.7;">Need to update your slot? Reply to this mail or call our reservation desk and we will help you quickly.</p>
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

function buildTextEmail(data) {
  const preorders = data.preorders.length
    ? data.preorders.map((item) => `- ${item.name} x${item.quantity}: ${formatCurrency(item.price * item.quantity)}`).join('\n')
    : '- No pre-order selected';

  return [
    `Hi ${data.customer.name},`,
    '',
    'Your Araku table reservation is confirmed.',
    `Booking ID: ${data.bookingId}`,
    `Table: ${data.reservation.table}`,
    `Date: ${data.reservation.date}`,
    `Time: ${data.reservation.timeIn} - ${data.reservation.timeOut}`,
    `Guests: ${data.reservation.guests}`,
    '',
    'Pre-order:',
    preorders,
    `Pre-order Total: ${formatCurrency(data.totalPreorder)}`,
    '',
    'Thank you for choosing Araku.'
  ].join('\n');
}

export async function sendReservationConfirmationMail({ mailUser, mailAppPassword, payload }) {
  if (!mailUser || !mailAppPassword) {
    throw makeError('Email credentials are missing. Configure MAIL_USER and MAIL_APP_PASSWORD.', 500);
  }

  const data = normalizePayload(payload);

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailUser,
      pass: mailAppPassword
    }
  });

  await transporter.sendMail({
    from: `Araku Reserve <${mailUser}>`,
    to: data.customer.email,
    subject: `Reservation Confirmed • ${data.bookingId}`,
    html: buildHtmlEmail(data),
    text: buildTextEmail(data)
  });

  return {
    bookingId: data.bookingId,
    email: data.customer.email
  };
}
