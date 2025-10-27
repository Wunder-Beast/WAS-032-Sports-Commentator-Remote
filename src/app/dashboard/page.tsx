import { redirect } from "next/navigation";
import { isSuperAdmin } from "@/lib/utils";
import { getServerAuthSession } from "@/server/auth";
import FilesByPlay from "./_components/filesByPlay";
import LeadsTable from "./_components/leadsTable";

export default async function Dashboard() {
	const session = await getServerAuthSession();

	if (!session) {
		return redirect("api/auth/signin");
	}

	return (
		<div className="flex flex-1 flex-col">
			<div className="container py-5">
				<div className="grid grid-cols-1 gap-5">
					<FilesByPlay />
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
