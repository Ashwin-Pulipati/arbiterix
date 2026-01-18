import { useCallback, useMemo, useState } from "react";
import {
  useAsyncFn,
  useDebounce,
  useMountedState,
  useSetState,
} from "react-use";
import { api, ApiError } from "@/lib/api";
import type { Document, DocumentCreate } from "@/types";
import type { ApiUserHeaders } from "@/lib/api";
import type { DocumentsDialogState } from "./documents.types";

type State = {
  query: string;
  debounced: string;
  dialog: DocumentsDialogState;
};

export function useDocumentsController(user: ApiUserHeaders) {
  const isMounted = useMountedState();
  const [docs, setDocs] = useState<Document[]>([]);

  const [state, setState] = useSetState<State>({
    query: "",
    debounced: "",
    dialog: { open: false, mode: "create" },
  });

  const [listState, fetchList] = useAsyncFn(async () => {
    const ac = new AbortController();
    const data = await api.documents.list(user, ac.signal);
    setDocs(data);
    return data;
  }, [user.id, user.tenant, user.role, user.username]);

  const refresh = useCallback(async () => {
    const res = await fetchList();
    return res;
  }, [fetchList]);

  useDebounce(
    () => setState({ debounced: state.query.trim().toLowerCase() }),
    250,
    [state.query]
  );

  const filtered = useMemo(() => {
    const q = state.debounced;
    if (!q) return docs;
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) || (d.content || "").toLowerCase().includes(q)
    );
  }, [docs, state.debounced]);

  const openCreate = useCallback(
    () => setState({ dialog: { open: true, mode: "create" } }),
    [setState]
  );
  const openEdit = useCallback(
    (doc: Document) => setState({ dialog: { open: true, mode: "edit", doc } }),
    [setState]
  );
  const closeDialog = useCallback(
    () => setState({ dialog: { open: false, mode: "create" } }),
    [setState]
  );
  
  const updateDocInState = useCallback((updated: Document) => {
    setDocs(current => current.map(d => d.id === updated.id ? updated : d));
  }, [setDocs]);

  const [createState, createDoc] = useAsyncFn(
    async (data: DocumentCreate) => {
      const newDoc = await api.documents.create(data, user);
      setDocs(current => [newDoc, ...current]);
      if (isMounted()) closeDialog();
      return newDoc;
    },
    [user, closeDialog, isMounted]
  );

  const [updateState, updateDoc] = useAsyncFn(
    async (id: number, data: DocumentCreate) => {
      const updated = await api.documents.update(id, data, user);
      updateDocInState(updated);
      if (isMounted()) closeDialog();
      return updated;
    },
    [user, updateDocInState, closeDialog, isMounted]
  );

  const [deleteState, deleteDoc] = useAsyncFn(
    async (id: number) => {
      await api.documents.delete(id, user);
      setDocs(current => current.filter(d => d.id !== id));
    },
    [user]
  );

  const [requestDeleteState, requestDeleteDoc] = useAsyncFn(
    async (id: number) => {
      try {
        const updated = await api.documents.requestDelete(id, user);
        updateDocInState(updated);
        return updated;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new Error("Failed to request deletion");
      }
    },
    [user, updateDocInState]
  );

  const [undoRequestDeleteState, undoRequestDeleteDoc] = useAsyncFn(
    async (id: number) => {
      try {
        const updated = await api.documents.undoRequestDelete(id, user);
        updateDocInState(updated);
        return updated;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new Error("Failed to undo deletion request");
      }
    },
    [user, updateDocInState]
  );

  return useMemo(
    () => ({
      state,
      setQuery: (q: string) => setState({ query: q }),
      listState,
      documents: filtered,
      actions: {
        refresh,
        openCreate,
        openEdit,
        closeDialog,
        createDoc,
        updateDoc,
        deleteDoc,
        requestDeleteDoc,
        undoRequestDeleteDoc,
      },
      ops: {
        creating: createState.loading,
        updating: updateState.loading,
        deleting: deleteState.loading,
        requestingDelete: requestDeleteState.loading,
        undoingRequestDelete: undoRequestDeleteState.loading,
      },
    }),
    [
      state,
      listState,
      filtered,
      refresh,
      openCreate,
      openEdit,
      closeDialog,
      createDoc,
      updateDoc,
      deleteDoc,
      requestDeleteDoc,
      undoRequestDeleteDoc,
      createState.loading,
      updateState.loading,
      deleteState.loading,
      requestDeleteState.loading,
      undoRequestDeleteState.loading,
      setState,
    ]
  );
}
