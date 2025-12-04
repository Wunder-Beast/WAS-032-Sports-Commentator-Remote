import { desc, or, sql } from "drizzle-orm";
import { env } from "@/env";
import { ilike } from "@/lib/utils";
import { db } from "@/server/db";
import { leads } from "@/server/db/schema";

// Helper function to validate API key
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

	const url = new URL(req.url);
	const query = url.searchParams.get("q");

	try {
		if (query === "") {
			const response = await db.query.leads.findMany({
				limit: 100,
				orderBy: desc(leads.createdAt),
			});
			return Response.json(response);
		}

		const p1 = db.query.leads
			.findMany({
				limit: 100,
				where: or(
					ilike(leads.firstName, sql.placeholder("query")),
					ilike(leads.lastName, sql.placeholder("query")),
					ilike(leads.phone, sql.placeholder("query")),
				),
				orderBy: desc(leads.createdAt),
			})
			.prepare();

		const response = await p1.execute({ query: `%${query}%` });
		return Response.json(response);
	} catch (e) {
		console.error("failed insert", e);
		return Response.json(e, { status: 400 });
	}
};

export { handler as GET };
