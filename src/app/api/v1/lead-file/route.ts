import { env } from "@/env";
import { db } from "@/server/db";
import { insertLeadFilesSchema, leadFiles } from "@/server/db/schema";

const validateApiKey = (req: Request): boolean => {
	const authHeader = req.headers.get("authorization");
	const apiKey = authHeader?.startsWith("Bearer ")
		? authHeader.slice(7)
		: authHeader;
	return apiKey === env.API_KEY;
};

const handler = async (req: Request) => {
	if (!validateApiKey(req)) {
		console.error("Unauthorized request - headers debug", req.headers);
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	try {
		const body = await req.json();
		const parsed = insertLeadFilesSchema.parse(body);

		if (!parsed.play) {
			return Response.json("Play is required", { status: 400 });
		}

		const [leadFile] = await db.insert(leadFiles).values(parsed).returning();

		return Response.json(leadFile, { status: 201 });
	} catch (e) {
		console.error("failed insert", e);
		return Response.json(e, { status: 400 });
	}
};

export { handler as POST };
