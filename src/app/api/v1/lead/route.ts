import { eq } from "drizzle-orm";
import { isValidPhoneNumber } from "libphonenumber-js";
import { env } from "@/env";
import { db } from "@/server/db";
import { leadFiles, leads } from "@/server/db/schema";

// Helper function to normalize phone numbers
const normalizePhoneNumber = (phoneNumber: string): string | null => {
	try {
		// Remove any non-digit characters except +
		const cleaned = phoneNumber.replace(/[^\d+]/g, "");

		// If it's already in +1 format, use as-is
		if (cleaned.startsWith("+1") && cleaned.length === 12) {
			return cleaned;
		}
		if (cleaned.length === 10) {
			// If it's 10 digits, add +1 prefix
			return `+1${cleaned}`;
		}
		return null;
	} catch {
		return null;
	}
};

// Helper function to validate API key
const validateApiKey = (req: Request): boolean => {
	const authHeader = req.headers.get("authorization");
	const apiKey = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7)
		: authHeader;
	return apiKey === env.API_KEY;
};

// GET /api/v1/lead?phoneNumber=xxx - Lookup lead by phone number
const getHandler = async (req: Request) => {
	if (!validateApiKey(req)) {
		console.error("Unauthorized request - headers debug", req.headers);
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	const url = new URL(req.url);
	const phoneNumber = url.searchParams.get("phoneNumber");

	if (!phoneNumber) {
		return Response.json(
			{ error: "Missing required query parameter: phoneNumber" },
			{ status: 400 },
		);
	}

	const normalizedPhone = normalizePhoneNumber(phoneNumber);
	if (!normalizedPhone) {
		return Response.json(
			{
				error:
					"Invalid phone number format. Must be 10 digits or +1 followed by 10 digits",
			},
			{ status: 400 },
		);
	}

	// Validate the normalized number
	if (!isValidPhoneNumber(normalizedPhone, "US")) {
		return Response.json({ error: "Invalid phone number" }, { status: 400 });
	}

	try {
		const lead = await db.query.leads.findFirst({
			where: eq(leads.phone, normalizedPhone),
		});

		if (!lead) {
			return Response.json({
				phoneNumber: normalizedPhone,
				found: false,
			});
		}

		return Response.json({
			phoneNumber: normalizedPhone,
			name: lead.name || "",
			found: true,
		});
	} catch (e) {
		console.error("API error:", e);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
};

// POST /api/v1/lead - Save recording (leadFile) for a phone number
const postHandler = async (req: Request) => {
	if (!validateApiKey(req)) {
		console.error("Unauthorized request - headers debug", req.headers);
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	let requestJson: { phoneNumber?: string; localFilePath?: string };
	try {
		requestJson = await req.json();
	} catch {
		return Response.json(
			{ error: "Invalid JSON in request body" },
			{ status: 400 },
		);
	}

	const { phoneNumber, localFilePath } = requestJson;

	if (!phoneNumber || !localFilePath) {
		return Response.json(
			{ error: "Missing required fields: phoneNumber and localFilePath" },
			{ status: 400 },
		);
	}

	const normalizedPhone = normalizePhoneNumber(phoneNumber);
	if (!normalizedPhone) {
		return Response.json(
			{
				error:
					"Invalid phone number format. Must be 10 digits or +1 followed by 10 digits",
			},
			{ status: 400 },
		);
	}

	// Validate the normalized number
	if (!isValidPhoneNumber(normalizedPhone, "US")) {
		return Response.json({ error: "Invalid phone number" }, { status: 400 });
	}

	try {
		// Check if lead exists
		let existingLead = await db.query.leads.findFirst({
			where: eq(leads.phone, normalizedPhone),
		});

		// If lead doesn't exist, create it with null email and name
		if (!existingLead) {
			console.log(
				`Lead not found for phone ${normalizedPhone}, creating new lead`,
			);
			const newLeads = await db
				.insert(leads)
				.values({
					phone: normalizedPhone,
					name: null,
					email: null,
					terms: false,
					agePassed: false,
				})
				.returning();

			existingLead = newLeads[0];
			if (!existingLead) {
				return Response.json(
					{ error: "Failed to create lead" },
					{ status: 500 },
				);
			}
		}

		// Insert lead file
		const leadFile = await db
			.insert(leadFiles)
			.values({
				leadId: existingLead.id,
				localFilePath,
				remoteFilePath: null,
			})
			.returning();

		if (!leadFile[0]) {
			return Response.json(
				{ error: "Failed to create lead file record" },
				{ status: 500 },
			);
		}

		console.log(
			`Successfully saved recording for ${normalizedPhone} - leadId: ${existingLead.id}, fileId: ${leadFile[0].id}`,
		);

		return Response.json({
			success: true,
			leadId: existingLead.id,
			fileId: leadFile[0].id,
			message: "Recording saved successfully",
		});
	} catch (e) {
		console.error("API error:", e);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
};

export { getHandler as GET, postHandler as POST };
