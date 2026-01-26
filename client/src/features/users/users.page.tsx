"use client";

import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import type { UserCreate } from "@/types";
import { useCallback } from "react";
import { useTitle } from "react-use";
import { toast } from "sonner";
import { UserDialog } from "./components/user-dialog";
import { UsersTable } from "./components/users-table";
import { useUsersController } from "./users.controller";

export function UsersPage() {
  useTitle("Arbiterix • Users");
  const { user, availableUsers, refetchUsers } = useUser();
  const ctrl = useUsersController(user);

  const onDialogSubmit = useCallback(
    async (v: UserCreate) => {
      try {
        await ctrl.actions.createUser(v);
        refetchUsers();
        toast.success("User created successfully");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to create user");
      }
    },
    [ctrl.actions, refetchUsers],
  );

  const onDelete = useCallback(
    async (id: number) => {
      try {
        await ctrl.actions.deleteUser(id);
        refetchUsers();
        toast.success("User deleted successfully");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to delete user");
      }
    },
    [ctrl.actions, refetchUsers],
  );

  const onUpdateRole = useCallback(
    async (id: number, role: "admin" | "user") => {
      try {
        await ctrl.actions.updateRole(id, role);
        refetchUsers();
        toast.success(`User role updated to ${role}`);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to update user role",
        );
      }
    },
    [ctrl.actions, refetchUsers],
  );

  const onResetPassword = useCallback(
    async (id: number, password: string) => {
      try {
        await ctrl.actions.resetPassword(id, password);
        toast.success("Password reset successfully");
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to reset password",
        );
      }
    },
    [ctrl.actions],
  );

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <Button onClick={ctrl.actions.openDialog}>Create User</Button>
        </div>
        <UsersTable
          users={availableUsers}
          currentUser={user}
          onDelete={onDelete}
          onUpdateRole={onUpdateRole}
          onResetPassword={onResetPassword}
        />
      </div>
      <UserDialog
        open={ctrl.state.isDialogOpen}
        loading={ctrl.ops.creating}
        onClose={ctrl.actions.closeDialog}
        onSubmit={onDialogSubmit}
      />
    </>
  );
}
