// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Hello from Cloudflare Trunstile!');

const ips = (req: Request) => {
	return req.headers.get('x-forwarded-for')?.split(/\s*,\s*/);
};

serve(async req => {
	// This is needed if you're planning to invoke your function from a browser.
	if (req.method === 'OPTIONS') {
		return new Response('ok', { headers: corsHeaders });
	}

	try {
		const { token } = await req.json();
		const clientIps = ips(req) || [''];
		const ip = clientIps[0];

		// Validate the token by calling the
		// "/siteverify" API endpoint.
		const formData = new FormData();
		formData.append('secret', Deno.env.get('CLOUDFLARE_SECRET_KEY') ?? '');
		formData.append('response', token);
		formData.append('remoteip', ip);

		const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
		const result = await fetch(url, {
			body: formData,
			method: 'POST',
		});

		const outcome = await result.json();
		console.log(outcome);
		return new Response(JSON.stringify({ success: true }), { headers: corsHeaders });
	} catch (err) {
		return new Response(JSON.stringify(err.message), { headers: corsHeaders });
	}
});

// To invoke:
// curl -i --location --request POST 'http://localhost:54321/functions/v1/' \
//   --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
//   --header 'Content-Type: application/json' \
//   --data '{"name":"Functions"}'
