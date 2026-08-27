import { EmailMessage } from 'cloudflare:email';
import { createMimeMessage } from 'mimetext';

export async function onRequestPost(context) {
	const { request, env } = context;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, 400);
	}

	const { name, email, brand, location, message } = body;

	if (!name || !message) {
		return json({ error: 'Name and message are required' }, 400);
	}

	// Honeypot: bots fill hidden fields, real users never see this one.
	if (body['_hp']) {
		return json({ ok: true });
	}

	const emailSubject = brand
		? `New inquiry from ${name} — ${brand}`
		: `New inquiry from ${name}`;

	const emailHtml = `
		<div style="font-family: sans-serif; max-width: 600px;">
			<p><strong>Name:</strong> ${escapeHtml(name)}</p>
			${email ? `<p><strong>Email:</strong> ${escapeHtml(email)}</p>` : ''}
			${brand ? `<p><strong>Property / Brand:</strong> ${escapeHtml(brand)}</p>` : ''}
			${location ? `<p><strong>Location:</strong> ${escapeHtml(location)}</p>` : ''}
			<hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
			<p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
		</div>
	`;

	const recipient = env.RECIPIENT_EMAIL || 'anna.k.ext@gmail.com';
	const sender = env.FROM_EMAIL || 'noreply@senja.studio';

	const msg = createMimeMessage();
	msg.setSender({ name: 'Senja Studio', addr: sender });
	msg.setRecipient(recipient);
	if (email) msg.setHeader('Reply-To', email);
	msg.setSubject(emailSubject);
	msg.addMessage({ contentType: 'text/html', data: emailHtml });

	try {
		const eml = new EmailMessage(sender, recipient, msg.asRaw());
		await env.SEND_EMAIL.send(eml);
	} catch (err) {
		console.error('Email send error:', err);
		return json({ error: 'Failed to send message' }, 500);
	}

	return json({ ok: true });
}

function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function json(data, status = 200) {
	return new Response(JSON.stringify(data), {
		status,
		headers: { 'Content-Type': 'application/json' },
	});
}
