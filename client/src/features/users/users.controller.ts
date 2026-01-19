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

  return useMemo(
    () => ({
      state,
      ops: {
        creating: createState.loading,
      },
      actions: {
        openDialog,
        closeDialog,
        createUser,
      },
    }),
    [state, createState.loading, openDialog, closeDialog, createUser]
  );
}