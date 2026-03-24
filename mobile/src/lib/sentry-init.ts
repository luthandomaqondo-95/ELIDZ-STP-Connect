import * as Sentry from '@sentry/react-native';
import type { Event, EventHint } from '@sentry/core';
import { Platform } from 'react-native';

/** Fraction of "noise" events to keep (rest dropped in beforeSend). */
const NON_CRITICAL_ERROR_SAMPLE_RATE = 0.12;
const NETWORK_FLAKY_SAMPLE_RATE = 0.25;

const SENTRY_DSN =
	'https://091563b9a05c0524f9a8f88c750e3b55@o4509637349277697.ingest.us.sentry.io/4510425767936000';

function flattenEventText(event: Event): string {
	const parts: string[] = [];
	if (event.message) parts.push(event.message);
	for (const ex of event.exception?.values ?? []) {
		if (ex.type) parts.push(ex.type);
		if (ex.value) parts.push(ex.value);
	}
	return parts.join(' | ').toLowerCase();
}

function isNetworkFlakyMessage(text: string): boolean {
	return (
		text.includes('network request failed') ||
		text.includes('failed to fetch') ||
		text.includes('network error') ||
		text.includes('connection') && text.includes('refused') ||
		text.includes('timeout') ||
		text.includes('econnreset') ||
		text.includes('enotfound') ||
		text.includes('offline')
	);
}

function isUserCancelledAuth(text: string): boolean {
	return (
		text.includes('cancelled') ||
		text.includes('canceled') ||
		text.includes('user cancelled') ||
		text.includes('err_request_canceled') ||
		text.includes('err_canceled') ||
		text.includes('sign_in_canceled')
	);
}

function isSupabaseRowNotFound(text: string): boolean {
	return text.includes('pgrst116') || text.includes('row not found') || text.includes('0 rows');
}

function mergeTags(
	event: Event,
	tags: Record<string, string>
): void {
	event.tags = { ...event.tags, ...tags };
}

/**
 * Drop or downgrade noise; tag so Sentry issues can be filtered (e.g. issue_class:expected).
 */
function beforeSend(event: Event, _hint: EventHint): Event | null {
	const text = flattenEventText(event);

	mergeTags(event, {
		app_platform: Platform.OS,
	});

	if (isUserCancelledAuth(text)) {
		return null;
	}

	if (isSupabaseRowNotFound(text) || text.includes('profile not found for user')) {
		event.level = 'info';
		mergeTags(event, {
			issue_class: 'expected',
			domain: 'data',
		});
		return event;
	}

	if (isNetworkFlakyMessage(text)) {
		if (Math.random() > NETWORK_FLAKY_SAMPLE_RATE) {
			return null;
		}
		event.level = event.level === 'fatal' ? 'error' : 'warning';
		mergeTags(event, {
			issue_class: 'transient_network',
			domain: 'network',
		});
		return event;
	}

	// Auth / session edge cases: keep visibility but not as high-severity production bugs
	if (
		text.includes('invalid login credentials') ||
		text.includes('invalid_grant') ||
		text.includes('session') && text.includes('missing') ||
		text.includes('jwt') && text.includes('expired')
	) {
		if (Math.random() > NON_CRITICAL_ERROR_SAMPLE_RATE) {
			return null;
		}
		event.level = 'warning';
		mergeTags(event, {
			issue_class: 'expected_auth',
			domain: 'auth',
		});
		return event;
	}

	mergeTags(event, {
		issue_class: 'app',
	});
	return event;
}

export function initSentry(): void {
	Sentry.init({
		dsn: SENTRY_DSN,

		sendDefaultPii: true,
		enableLogs: true,

		replaysSessionSampleRate: 0.1,
		replaysOnErrorSampleRate: 1,
		integrations: [],

		environment: __DEV__ ? 'development' : 'production',
		sampleRate: 1,
		tracesSampleRate: __DEV__ ? 0.3 : 0.15,

		ignoreErrors: [
			/^AbortError$/i,
			'AbortError',
			/BrowserEngineKit.*WebProcessProxy.*Operation not permitted/,
			/Non-Error promise rejection captured/,
			/Unable to activate keep awake/,
			/The request timed out/,
			/Request was cancelled/,
		],

		beforeSend,
	});
}
