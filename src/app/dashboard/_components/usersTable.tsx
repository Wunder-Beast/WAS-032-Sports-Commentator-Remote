"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { CopyIcon, EditIcon, Trash2Icon, UserPlusIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import { useId, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { isSuperAdmin } from "@/lib/utils";
import { api } from "@/trpc/react";

type User = {
	id: string;
	name: string | null;
	email: string;
	emailVerified: Date | null;
	role: "user" | "admin" | "super";
	image: string | null;
};

export function UsersTable() {
	const [editingUser, setEditingUser] = useState<User | null>(null);
	const [deleteUser, setDeleteUser] = useState<User | null>(null);
	const [showAddUser, setShowAddUser] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		role: "user" as "user" | "admin" | "super",
	});
	const { data: session } = useSession();
	const currentUserRole = session?.user?.role;
	const nameFieldId = useId();
	const emailFieldId = useId();
	const roleFieldId = useId();
	const addNameFieldId = useId();
	const addEmailFieldId = useId();
	const addRoleFieldId = useId();

	const utils = api.useUtils();
	const users = api.user.getUsers.useQuery();
	const updateUser = api.user.updateUser.useMutation({
		onSuccess: () => {
			toast.success("User updated successfully");
			setEditingUser(null);
			utils.user.getUsers.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update user");
		},
	});
	const createUser = api.user.createAdmin.useMutation({
		onSuccess: () => {
			toast.success("User created successfully");
			setShowAddUser(false);
			setFormData({ name: "", email: "", role: "user" });
			utils.user.getUsers.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to create user");
		},
	});
	const deleteUserMutation = api.user.deleteUser.useMutation({
		onSuccess: () => {
			toast.success("User deleted successfully");
			setDeleteUser(null);
			utils.user.getUsers.invalidate();
		},
		onError: (error) => {
			toast.error(error.message || "Failed to delete user");
		},
	});

	const columns: ColumnDef<User>[] = [
		{
			accessorKey: "name",
			header: "Name",
			cell: ({ row }) => {
				return row.getValue("name") || "-";
			},
		},
		{
			accessorKey: "email",
			header: "Email",
		},
		{
			accessorKey: "role",
			header: "Role",
			cell: ({ row }) => {
				const role: string = row.getValue("role");
				const variant = isSuperAdmin(role)
					? "default"
					: role === "admin"
						? "secondary"
						: "outline";
				return (
					<Badge variant={variant}>
						{isSuperAdmin(role)
							? "Super Admin"
							: role === "admin"
								? "Admin"
								: "User"}
					</Badge>
				);
			},
		},
		{
			accessorKey: "emailVerified",
			header: "First Login",
			cell: ({ row }) => {
				const verified: Date | null = row.getValue("emailVerified");
				if (!verified) {
					return <Badge variant="outline">Never</Badge>;
				}
				return (
					<Badge variant="default">{format(verified, "MMM d, yyyy")}</Badge>
				);
			},
		},
		{
			id: "actions",
			header: "Actions",
			cell: ({ row }) => {
				const user = row.original;
				const canEdit =
					isSuperAdmin(currentUserRole) || !isSuperAdmin(user.role);
				const canDelete =
					isSuperAdmin(currentUserRole) || !isSuperAdmin(user.role);

				return (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => {
								navigator.clipboard.writeText(user.email);
								toast.success("Email copied to clipboard");
							}}
							title="Copy email"
						>
							<CopyIcon className="h-4 w-4" />
						</Button>
						{canEdit && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									setEditingUser(user);
									setFormData({
										name: user.name || "",
										email: user.email,
										role: user.role,
									});
								}}
								title="Edit user"
							>
								<EditIcon className="h-4 w-4" />
							</Button>
						)}
						{canDelete && (
							<Button
								variant="ghost"
								size="sm"
								onClick={() => setDeleteUser(user)}
								title="Delete user"
								className="text-red-600 hover:bg-red-50 hover:text-red-700"
							>
								<Trash2Icon className="h-4 w-4" />
							</Button>
						)}
					</div>
				);
			},
		},
	];

	if (users.isPending) {
		return (
			<div className="w-full">
				<Skeleton className="h-48 w-full rounded" />
			</div>
		);
	}

	return (
		<>
			<div className="w-full space-y-4 rounded-lg border bg-card p-5 text-card-foreground shadow-xs">
				{users.data ? (
					<>
						<div className="flex items-center justify-end">
							<Button
								onClick={() => {
									setFormData({ name: "", email: "", role: "user" });
									setShowAddUser(true);
								}}
								variant="default"
							>
								<UserPlusIcon className="mr-2 h-4 w-4" />
								Add User
							</Button>
						</div>
						<DataTable columns={columns} data={users.data} />
					</>
				) : null}
			</div>

			{/* Edit User Dialog */}
			<Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Edit User</DialogTitle>
						<DialogDescription>
							Make changes to the user account. Click save when you're done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={nameFieldId} className="text-right">
								Name
							</Label>
							<Input
								id={nameFieldId}
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="col-span-3"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={emailFieldId} className="text-right">
								Email
							</Label>
							<Input
								id={emailFieldId}
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="col-span-3"
								disabled={!!editingUser}
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={roleFieldId} className="text-right">
								Role
							</Label>
							<Select
								value={formData.role}
								onValueChange={(value: "user" | "admin" | "super") =>
									setFormData({ ...formData, role: value })
								}
							>
								<SelectTrigger className="col-span-3" id={roleFieldId}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
									{currentUserRole === "super" && (
										<SelectItem value="super">Super Admin</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setEditingUser(null)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								if (editingUser) {
									updateUser.mutate({
										id: editingUser.id,
										name: formData.name,
										role: formData.role,
									});
								}
							}}
							disabled={updateUser.isPending}
						>
							{updateUser.isPending ? "Saving..." : "Save changes"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Confirmation Dialog */}
			<Dialog open={!!deleteUser} onOpenChange={() => setDeleteUser(null)}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Are you sure?</DialogTitle>
						<DialogDescription>
							This action cannot be undone. This will permanently delete{" "}
							<strong>{deleteUser?.email}</strong> from the system.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteUser(null)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								if (deleteUser) {
									deleteUserMutation.mutate({ id: deleteUser.id });
								}
							}}
							disabled={deleteUserMutation.isPending}
						>
							{deleteUserMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Add User Dialog */}
			<Dialog open={showAddUser} onOpenChange={setShowAddUser}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Add New User</DialogTitle>
						<DialogDescription>
							Create a new user account. Fill in the details below.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={addNameFieldId} className="text-right">
								Name
							</Label>
							<Input
								id={addNameFieldId}
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								className="col-span-3"
								placeholder="Enter user name"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={addEmailFieldId} className="text-right">
								Email
							</Label>
							<Input
								id={addEmailFieldId}
								type="email"
								value={formData.email}
								onChange={(e) =>
									setFormData({ ...formData, email: e.target.value })
								}
								className="col-span-3"
								placeholder="Enter email address"
							/>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor={addRoleFieldId} className="text-right">
								Role
							</Label>
							<Select
								value={formData.role}
								onValueChange={(value: "user" | "admin" | "super") =>
									setFormData({ ...formData, role: value })
								}
							>
								<SelectTrigger className="col-span-3" id={addRoleFieldId}>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="user">User</SelectItem>
									<SelectItem value="admin">Admin</SelectItem>
									{currentUserRole === "super" && (
										<SelectItem value="super">Super Admin</SelectItem>
									)}
								</SelectContent>
							</Select>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowAddUser(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => {
								createUser.mutate({
									name: formData.name,
									email: formData.email,
									role: formData.role,
								});
							}}
							disabled={
								createUser.isPending || !formData.name || !formData.email
							}
						>
							{createUser.isPending ? "Creating..." : "Create User"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
