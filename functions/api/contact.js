export async function onRequestPost(context) {
	const { request, env } = context;

	let body;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON' }, 400);
	}

	const { name, brand, venue, location, message } = body;
	const turnstileToken = body['cf-turnstile-response'];

	if (!name || !message) {
		return json({ error: 'Name and message are required' }, 400);
	}

	if (!turnstileToken) {
		return json({ error: 'Missing verification token' }, 400);
	}

	if (body['_hp']) {
		return json({ ok: true });
	}

	const turnstileValid = await verifyTurnstile(
		turnstileToken,
		request.headers.get('CF-Connecting-IP') || '',
		env.TURNSTILE_SECRET_KEY
	);
	if (!turnstileValid) {
		return json({ error: 'Verification failed' }, 403);
	}

	const emailSubject = brand
		? `New inquiry from ${name} — ${brand}`
		: `New inquiry from ${name}`;

	const emailHtml = `
		<div style="font-family: sans-serif; max-width: 600px;">
			<p><strong>Name:</strong> ${escapeHtml(name)}</p>
			${brand ? `<p><strong>Property / Brand:</strong> ${escapeHtml(brand)}</p>` : ''}
			${venue ? `<p><strong>Type of venue:</strong> ${escapeHtml(venue)}</p>` : ''}
			${location ? `<p><strong>Location:</strong> ${escapeHtml(location)}</p>` : ''}
			<hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
			<p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
		</div>
	`;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			from: env.FROM_EMAIL || 'Senja Studio <noreply@contact.senjastudio.com>',
			to: [env.RECIPIENT_EMAIL || 'anna.k.ext@gmail.com'],
			subject: emailSubject,
			html: emailHtml,
		}),
	});

	if (!res.ok) {
		console.error('Resend error:', await res.text());
		return json({ error: 'Failed to send message' }, 500);
	}

	return json({ ok: true });
}

async function verifyTurnstile(token, ip, secret) {
	const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({ secret, response: token, remoteip: ip }),
	});
	const data = await res.json();
	return data.success === true;
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
