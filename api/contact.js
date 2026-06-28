/*=======================================================================================
/api/contact.js

serverless function for vercel- sends contact form emails via Resend

*this file lives at project root in api folder
=========================================================================================*/

export default async function handler(req, res) {

    /* CORS- only requests from the live site */
    res.setHeader('Access-Control-Allow-Origin', 'https://roykerns.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    /* PRE-FLIGHT */
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    /* ── Parse body ── */
    const { name, email, subject, message } = req.body || {};

    /* ── Validate required fields ── */
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    /* ── Check env vars are set ── */
    if (!process.env.RESEND_API_KEY || !process.env.CONTACT_TO_EMAIL) {
        console.error('Missing RESEND_API_KEY or CONTACT_TO_EMAIL env vars');
        return res.status(500).json({ error: 'Server configuration error.' });
    }

    /* ── Build email content ── */
    const emailSubject = subject
        ? `[roykerns.vercel.app] ${subject} — from ${name}`
        : `[roykerns.vercel.app] New message from ${name}`;

    const htmlBody = `

     <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #333;">

            <div style="border-bottom: 2px solid #8A35E8; padding-bottom: 1rem; margin-bottom: 1.5rem;">
                <h2 style="font-size: 1.2rem; color: #8A35E8; margin: 0 0 0.25rem;">
                    New contact form message
                </h2>
                <p style="margin: 0; font-size: 0.85rem; color: #999;">
                    roykerns.vercel.app
                </p>
            </div>

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 1.5rem;">
                <tr>
                    <td style="padding: 0.4rem 0; font-size: 0.85rem; color: #666; width: 80px;">
                        <strong>From</strong>
                    </td>
                    <td style="padding: 0.4rem 0; font-size: 0.9rem;">
                        ${escapeHtml(name)} &lt;${escapeHtml(email)}&gt;
                    </td>
                </tr>
                ${subject ? `
                <tr>
                    <td style="padding: 0.4rem 0; font-size: 0.85rem; color: #666;">
                        <strong>Subject</strong>
                    </td>
                    <td style="padding: 0.4rem 0; font-size: 0.9rem;">
                        ${escapeHtml(subject)}
                    </td>
                </tr>` : ''}
            </table>
 
            <div style="background: #f9f9f9; border-left: 3px solid #8A35E8;
                        padding: 1.25rem 1.5rem; margin-bottom: 1.5rem;">
                <p style="margin: 0; font-size: 1rem; line-height: 1.8; white-space: pre-wrap;">
                    ${escapeHtml(message)}
                </p>
            </div>
 
            <div style="font-size: 0.8rem; color: #aaa; border-top: 1px solid #eee; padding-top: 1rem;">
                <p style="margin: 0;">
                    Hit <strong>Reply</strong> to respond directly to ${escapeHtml(name)}.
                </p>
            </div>
 
        </div>
    `;

    /* ── Send via Resend ── */
    try {
        const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                /*
                 * FROM: Resend's shared domain — no custom domain needed.
                 * When Roy gets a custom domain (e.g. roykerns.com), update this to:
                 *   "Roy M. Kerns Website <contact@roykerns.com>"
                 * and verify the domain in the Resend dashboard.
                 */
                from: 'Roy M. Kerns Website <onboarding@resend.dev>',
                to: [process.env.CONTACT_TO_EMAIL],
                reply_to: email,   // ← Roy hits Reply → goes to form sender
                subject: emailSubject,
                html: htmlBody,
            }),
        });

        if (!resendRes.ok) {
            const errData = await resendRes.json().catch(() => ({}));
            console.error('Resend API error:', errData);
            return res.status(502).json({
                error: 'Failed to send email. Message was saved to dashboard.',
            });
        }

        return res.status(200).json({ success: true });

    } catch (err) {
        console.error('Unexpected error in /api/contact:', err);
        return res.status(500).json({ error: 'Unexpected server error.' });
    }
}

/* ── Escape HTML to prevent injection in email body ── */
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

}