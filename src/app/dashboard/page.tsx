import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/utils";
import { getServerSession } from "@/server/auth";
import LeadsTable from "./_components/leadsTable";

export default async function Dashboard() {
	const session = await getServerSession();

	if (!session) {
		return redirect("/sign-in");
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="container py-5">
				<div className="grid grid-cols-1 gap-5">
					{isSuperAdmin(session.user.role) || session.user.role === "admin" ? (
						<div className="col-span-2">
							<LeadsTable />
						</div>
					) : null}
				</div>
			</div>
		</div>
	);
}
