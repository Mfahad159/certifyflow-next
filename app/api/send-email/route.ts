import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            to, subject, text, html, image, name, provider, apiKey,
            fromEmail, fromName, templateId, brandName, logoUrl, accentColor
        } = body;

        console.log(`[API] Email Request: to=${to} provider=${provider} hasImage=${!!image}`);

        if (!to || !subject) {
            return NextResponse.json({ error: 'Missing to or subject in request body' }, { status: 400 });
        }

        if (!provider || !apiKey) {
            return NextResponse.json({ error: 'Missing email provider or API key' }, { status: 400 });
        }

        const from = fromName ? `${fromName} <${fromEmail}>` : fromEmail;
        let emailHtml = html;

        if (templateId) {
            emailHtml = getTemplateHtml({
                templateId,
                recipientName: name,
                brandName: brandName || fromName || 'BulkCerts',
                logoUrl: logoUrl || 'https://i.ibb.co/3yhthnMj/Frame-1-6.png',
                accentColor: accentColor || '#6b55fd',
                certificateImageUrl: image,
                campaignName: subject
            });
        } else if (!emailHtml) {
            emailHtml = `<p>${text || ''}</p>${image ? `<img src="${image}" alt="Certificate for ${name}" style="max-width:100%;" />` : ''}`;
        }

        let result;

        switch (provider.toLowerCase()) {
            case 'resend':
                result = await sendWithResend({ to, from, subject, html: emailHtml, image, apiKey });
                break;
            case 'gmail':
            case 'smtp':
            case 'sendgrid':
            case 'mailgun':
            case 'aws ses':
                // Handle generic SMTP providers (including SendGrid/Mailgun SMTP relays)
                result = await sendWithNodemailer({ to, from, subject, html: emailHtml, image, apiKey, provider });
                break;
            default:
                return NextResponse.json({ error: `Unsupported provider: ${provider}` }, { status: 400 });
        }

        console.log(`[API] Email Success: to=${to}`);
        return NextResponse.json({ success: true, message: 'Email sent!', result });
    } catch (err: any) {
        console.error('[API] Email Error:', err);
        return NextResponse.json({
            error: err.message || 'Failed to send email',
            stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        }, { status: 500 });
    }
}

// Resend API implementation
async function sendWithResend({ to, from, subject, html, image, apiKey }: any) {
    const attachments = [];
    let processedHtml = html;

    // Handle embedded base64 certificate image
    if (image && image.includes('base64,')) {
        const content = image.split('base64,')[1];
        attachments.push({
            filename: 'certificate.png',
            content: content,
            content_id: 'certificate', // Resend uses content_id for CID referencing
        });
        // Replace the base64 string in the HTML with CID to keep the body size small
        processedHtml = processedHtml.replace(image, 'cid:certificate');
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html: processedHtml, attachments }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Resend error: ${error}`);
    }
    return response.json();
}

// Nodemailer implementation (Gmail, SendGrid, Mailgun, AWS SES, generic SMTP)
async function sendWithNodemailer({ to, from, subject, html, image, apiKey, provider }: any) {
    let transporter;

    if (provider.toLowerCase() === 'gmail') {
        const [email, appPassword] = apiKey.split(':');
        if (!email || !appPassword) {
            throw new Error('Gmail API key must be in format: email:appPassword');
        }
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: email,
                pass: appPassword,
            },
        });
    } else {
        // For SendGrid, Mailgun, AWS SES, or custom SMTP
        // Supported apiKey formats:
        // 1. SMTP Connection String (smtps://username:password@smtp.example.com)
        // 2. JSON String representing nodemailer options
        // 3. Fallback to extracting just API key for known providers (Sendgrid default behavior)
        try {
            if (apiKey.startsWith('smtp://') || apiKey.startsWith('smtps://')) {
                transporter = nodemailer.createTransport(apiKey);
            } else if (apiKey.startsWith('{')) {
                transporter = nodemailer.createTransport(JSON.parse(apiKey));
            } else {
                // As a fallback for SendGrid
                if (provider.toLowerCase() === 'sendgrid') {
                    transporter = nodemailer.createTransport({
                        host: 'smtp.sendgrid.net',
                        port: 587,
                        auth: {
                            user: 'apikey', // Default Sendgrid username
                            pass: apiKey
                        }
                    });
                }
                else {
                    throw new Error("For providers other than Resend/Gmail/SendGrid, please provide a full SMTP connection string (smtps://user:pass@host:port) or JSON config as the API key.");
                }
            }
        } catch (e) {
            throw new Error(`Failed to configure SMTP transport: ${e instanceof Error ? e.message : String(e)}`);
        }
    }

    const attachments = [];
    let processedHtml = html;

    if (image && image.includes('base64,')) {
        attachments.push({
            filename: 'certificate.png',
            content: image.split('base64,')[1],
            encoding: 'base64',
            cid: 'certificate' // Enables referencing attachment in HTML as <img src="cid:certificate" />
        });
        processedHtml = processedHtml.replace(image, 'cid:certificate');
    }

    const mailOptions = {
        from: from,
        to: to,
        subject: subject,
        html: processedHtml,
        attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);
    return { messageId: info.messageId, accepted: info.accepted };
}

function getTemplateHtml({ templateId, recipientName, brandName, logoUrl, accentColor, certificateImageUrl, campaignName }: any) {
    const brand = brandName || 'BulkCerts';
    const color = accentColor || '#2A43F8';
    const logo = logoUrl || 'https://i.ibb.co/3yhthnMj/Frame-1-6.png'; // Default template logo

    // Default Template HTML
    return `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #fafafa; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e4e4e7; border-radius: 32px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="padding: 40px; text-align: center;">
          <div style="margin-bottom: 32px;">
            <img src="${logo}" style="height: 48px; max-width: 200px;" alt="${brand}" onerror="this.style.display='none';this.nextElementSibling.style.display='block';" />
            <div style="display:none; font-size: 20px; font-weight: bold; color: ${color};">${brand}</div>
          </div>
          <h1 style="font-family: serif; font-style: italic; font-size: 30px; color: #09090b; margin: 0 0 16px 0;">Outstanding Achievement</h1>
          <p style="font-size: 16px; color: #71717a; margin-bottom: 32px;">Congratulations <b>${recipientName}</b>! Your certificate for <b>${campaignName}</b> is ready for delivery.</p>
          <div style="padding: 12px; background-color: #f4f4f5; border-radius: 20px; border: 1px solid rgba(0,0,0,0.05); margin-bottom: 40px;">
            ${certificateImageUrl ? `<img src="${certificateImageUrl}" style="width: 100%; border-radius: 12px; display: block;" alt="Certificate" />` : '<div style="padding: 40px; color: #999;">Certificate attachment included</div>'}
          </div>
          <a href="#" style="display: inline-block; padding: 16px 36px; background-color: ${color}; color: white; text-decoration: none; font-weight: bold; border-radius: 100px; font-size: 14px; box-shadow: 0 4px 12px ${color}30;">Verify Certificate</a>
          <p style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 2px; margin-top: 40px;">Verified via BulkCerts Secure Registry</p>
        </div>
        <div style="padding: 32px; background-color: #f4f4f5; border-top: 1px solid #e4e4e7;">
           <p style="margin: 0; font-size: 14px; font-weight: bold; color: #09090b;">${brand}</p>
           <p style="margin: 4px 0 0 0; font-size: 12px; color: #71717a;">Professional Certificate Delivery</p>
        </div>
      </div>
    </div>
  `;
}
