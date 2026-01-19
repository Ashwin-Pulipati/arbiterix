"use client";

import { useCallback } from "react";
import { useTitle } from "react-use";
import { toast } from "sonner";
import { useUser } from "@/components/providers/user-provider";
import { Button } from "@/components/ui/button";
import { UserDialog } from "./components/user-dialog";
import { useUsersController } from "./users.controller";
import type { UserCreate } from "@/types";

export function UsersPage() {
  useTitle("Arbiter • Users");
  const { user, refetchUsers } = useUser();
  const ctrl = useUsersController(user);

  const onDialogSubmit = useCallback(async (v: UserCreate) => {
    try {
      await ctrl.actions.createUser(v);
      refetchUsers();
      toast.success("User created successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create user");
    }
  }, [ctrl.actions, refetchUsers]);

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">User Management</h1>
          <Button onClick={ctrl.actions.openDialog}>Create User</Button>
        </div>
        {/* User table will go here */}
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
