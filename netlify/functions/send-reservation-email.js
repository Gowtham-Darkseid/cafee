import { sendReservationConfirmationMail } from '../../server/reservation-mailer.js';

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

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return response(200, { ok: true });
  }

  if (event.httpMethod !== 'POST') {
    return response(405, { ok: false, message: 'Method not allowed' });
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    const result = await sendReservationConfirmationMail({
      mailUser: process.env.MAIL_USER,
      mailAppPassword: process.env.MAIL_APP_PASSWORD,
      payload
    });

    return response(200, {
      ok: true,
      message: 'Reservation confirmation email sent.',
      ...result
    });
  } catch (error) {
    return response(error.statusCode || 500, {
      ok: false,
      message: error.message || 'Unable to send reservation confirmation email.'
    });
  }
};
