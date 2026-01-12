import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/utils";
import { getServerSession } from "@/server/auth";
import ChartLeadFilesPerDay from "./_components/chartLeadFilesPerDay";
import ChartLeadsByFileCount from "./_components/chartLeadsByFileCount";
import ChartLeadsPerDay from "./_components/chartLeadsPerDay";
import ChartPlayCountsPerDay from "./_components/chartPlayCountsPerDay";
import LeadsTable from "./_components/leadsTable";

export default async function Dashboard() {
	const session = await getServerSession();

	if (!session) {
		return redirect("/sign-in");
	}

	const isAdmin =
		isSuperAdmin(session.user.role) || session.user.role === "admin";

	return (
		<div className="flex flex-1 flex-col">
			<div className="container py-5">
				<div className="grid grid-cols-1 gap-5">
					{isAdmin ? (
						<>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<ChartLeadsPerDay />
								<ChartLeadFilesPerDay />
							</div>
							<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
								<ChartPlayCountsPerDay />
								<ChartLeadsByFileCount />
							</div>
							<LeadsTable />
						</>
					) : null}
				</div>
			</div>
		</div>
	);
}
