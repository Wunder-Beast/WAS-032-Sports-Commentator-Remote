import { redirect } from "next/navigation";
import { getServerSession } from "@/server/auth";
import { UsersTable } from "../_components/usersTable";

export default async function UsersPage() {
	const session = await getServerSession();

	// Check if user is an admin or super admin
	const userRole = session?.user?.role;

	if (userRole !== "admin" && userRole !== "super") {
		redirect("/dashboard");
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="container py-5">
				<div className="grid grid-cols-1 gap-5">
					<UsersTable />
				</div>
			</div>
		</div>
	);
}
