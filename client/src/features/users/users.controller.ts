import { useCallback, useMemo } from "react";
import { useAsyncFn, useSetState } from "react-use";
import { api } from "@/lib/api";
import type { UserCreate } from "@/types";
import type { ApiUserHeaders } from "@/lib/api";

type State = {
  isDialogOpen: boolean;
};

export function useUsersController(user: ApiUserHeaders) {
  const [state, setState] = useSetState<State>({
    isDialogOpen: false,
  });

  const openDialog = useCallback(() => setState({ isDialogOpen: true }), [setState]);
  const closeDialog = useCallback(() => setState({ isDialogOpen: false }), [setState]);

  const [createState, createUser] = useAsyncFn(
    async (data: UserCreate) => {
      await api.users.create(data, user);
      closeDialog();
    },
    [user, closeDialog]
  );

  const [deleteState, deleteUser] = useAsyncFn(
    async (id: number) => {
      await api.users.delete(id, user);
    },
    [user]
  );

  const [updateRoleState, updateRole] = useAsyncFn(
    async (id: number, role: "admin" | "user") => {
      await api.users.updateRole(id, role, user);
    },
    [user]
  );

  const [resetPasswordState, resetPassword] = useAsyncFn(
    async (id: number, password: string) => {
      await api.users.resetPassword(id, password, user);
    },
    [user]
  );

  return useMemo(
    () => ({
      state,
      ops: {
        creating: createState.loading,
        deleting: deleteState.loading,
        updatingRole: updateRoleState.loading,
        resettingPassword: resetPasswordState.loading,
      },
      actions: {
        openDialog,
        closeDialog,
        createUser,
        deleteUser,
        updateRole,
        resetPassword,
      },
    }),
    [
      state,
      createState.loading,
      deleteState.loading,
      updateRoleState.loading,
      resetPasswordState.loading,
      openDialog,
      closeDialog,
      createUser,
      deleteUser,
      updateRole,
      resetPassword,
    ]
  );
}