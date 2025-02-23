/// <reference types="vite/client" />
/// <reference types="unplugin-vue-router/client" />

interface ImportMetaEnv {
	// App
	readonly VITE_APP_TITLE: string;

	// Currency name set on server (Currency name which values stored on in database)
	readonly VITE_SERVER_CURRENCY: string;

	readonly VITE_ENDPOINT_REDIRECT_URL: string;

	// Supabase
	readonly VITE_SUPABASE_PROJECT_ID: string;
	readonly VITE_SUPABASE_ANON_KEY: string;

	// Exchange rates
	readonly VITE_EXCHANGER_API_URL: string;
	readonly VITE_EXCHANGER_API_KEY: string;

	// Cloudflare turnstile
	readonly VITE_TURNSTILE_SCRIPT_SRC: string;
	readonly VITE_TURNSTILE_SITE_KEY: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
