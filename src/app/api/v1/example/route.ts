import { env } from "@/env";

const handler = async (req: Request) => {
	const apiKey = req.headers.get("authorization");

	if (apiKey !== env.API_KEY) {
		return Response.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Example: Get query parameters
	const urlParams = new URLSearchParams(
		req.url.substring(req.url.lastIndexOf("?")),
	);

	const exampleParam = urlParams.get("example");

	if (!exampleParam) {
		return Response.json(
			{ error: "Missing required parameter" },
			{ status: 400 },
		);
	}

	// Add your API logic here
	try {
		return Response.json({
			success: true,
			data: { exampleParam },
		});
	} catch (e) {
		console.error("API error:", e);
		return Response.json({ error: "Internal server error" }, { status: 500 });
	}
};

export { handler as GET };
