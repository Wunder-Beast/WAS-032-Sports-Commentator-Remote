import { redirect } from "next/navigation";
import { getServerSession } from "@/server/auth";
import { ModerationQueue } from "../_components/moderationQueue";

export default async function ModerationPage() {
	const session = await getServerSession();

	const userRole = session?.user?.role;
	if (userRole !== "admin" && userRole !== "super") {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="container py-5">
				<div className="grid grid-cols-1 gap-5">
					<ModerationQueue />
				</div>
			</div>
		</div>
	);
}
