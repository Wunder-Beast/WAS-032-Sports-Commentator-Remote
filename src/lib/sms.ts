import twilio from "twilio";
import { env } from "@/env";

export class TwilioNotConfiguredError extends Error {
	constructor() {
		super("Twilio credentials are not configured");
		this.name = "TwilioNotConfiguredError";
	}
}

function getTwilioClient() {
	if (
		!env.TWILIO_ACCOUNT_SID ||
		!env.TWILIO_AUTH_TOKEN ||
		!env.TWILIO_MESSAGING_SERVICE_SID
	) {
		return null;
	}
	return twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
}

export function isTwilioConfigured(): boolean {
	return !!(
		env.TWILIO_ACCOUNT_SID &&
		env.TWILIO_AUTH_TOKEN &&
		env.TWILIO_MESSAGING_SERVICE_SID
	);
}

export interface SendSmsOptions {
	to: string;
	body: string;
}

export async function sendSms({ to, body }: SendSmsOptions): Promise<string> {
	const client = getTwilioClient();

	if (!client) {
		throw new TwilioNotConfiguredError();
	}

	const message = await client.messages.create({
		to,
		body,
		messagingServiceSid: env.TWILIO_MESSAGING_SERVICE_SID,
	});

	return message.sid;
}

export async function sendVideoShareSms(
	to: string,
	shareUrl: string,
): Promise<string> {
	const body = `AT&T - Commentator 2025\n\nThank you for participating.\nCheck out your final video!\n\n${shareUrl}`;
	return sendSms({ to, body });
}

export async function sendVideoRejectedSms(to: string): Promise<string> {
	const body = `AT&T - Commentator 2025\n\nThank you for participating.\nUnfortunately, we were unable to process your video.\n\nWe appreciate your understanding.`;
	return sendSms({ to, body });
}
