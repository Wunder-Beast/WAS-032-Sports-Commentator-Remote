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
	const body = `You crushed it on-air with AT&T at CFP. That's a guaranteed share-worthy highlight!\n\nDownload your video and share your big moment in the link below.\n\n${shareUrl}`;
	return sendSms({ to, body });
}

export async function sendVideoRejectedSms(to: string): Promise<string> {
	const body =
		"Coming in a little too hot!\n\nYour recording was flagged by a moderator, come back to give Make the Call another try and let's play a clean game!";
	return sendSms({ to, body });
}
