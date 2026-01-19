"use client";

import { useEffect, useCallback } from "react";
import { useUser } from "@/components/providers/user-provider";
import { toast } from "sonner";
import { useTitle } from "react-use";
import { DocumentsToolbar } from "./components/documents-toolbar";
import { DocumentsTable } from "./components/documents-table";
import { DocumentDialog } from "./components/document-dialog";
import { useDocumentsController } from "./documents.controller";
import type { Document, DocumentCreate } from "@/types";

export function DocumentsPage() {
  useTitle("Arbiter • Documents");

  const { user } = useUser();
  const ctrl = useDocumentsController(user);
  const { refresh, openEdit, deleteDoc, requestDeleteDoc, undoRequestDeleteDoc, updateDoc, createDoc } = ctrl.actions;

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dialog = ctrl.state.dialog;

  const onEditCallback = useCallback((d: Document) => openEdit(d), [openEdit]);

  const onDeleteCallback = useCallback(async (id: number) => {
    try {
      await deleteDoc(id);
      toast.success("Document deleted");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to delete document"
      );
    }
  }, [deleteDoc]);

  const onRequestDeleteCallback = useCallback(async (id: number) => {
    try {
      await requestDeleteDoc(id);
      toast.success("Deletion requested");
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Failed to request deletion"
      );
    }
  }, [requestDeleteDoc]);

  const onUndoRequestDeleteCallback = useCallback(async (id: number) => {
    try {
      await undoRequestDeleteDoc(id);
      toast.success("Deletion request undone");
    } catch (e) {
      toast.error(
        e instanceof Error
          ? e.message
          : "Failed to undo deletion request"
      );
    }
  }, [undoRequestDeleteDoc]);

  const onDialogSubmit = useCallback(async (v: DocumentCreate) => {
    try {
      if (dialog.mode === "edit" && dialog.doc) {
        await updateDoc(dialog.doc.id, v);
        toast.success("Document updated");
      } else {
        await createDoc(v);
        toast.success("Document created");
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Operation failed");
    }
  }, [dialog.mode, dialog.doc, updateDoc, createDoc]);

  return (
    <>
      <DocumentsToolbar
        query={ctrl.state.query}
        onQueryChange={ctrl.setQuery}
        onCreate={ctrl.actions.openCreate}
      />

      <DocumentsTable
        user={user}
        loading={ctrl.listState.loading}
        documents={ctrl.documents}
        onEdit={onEditCallback}
        onDelete={onDeleteCallback}
        onRequestDelete={onRequestDeleteCallback}
        onUndoRequestDelete={onUndoRequestDeleteCallback}
        disableActions={
          ctrl.ops.deleting ||
          ctrl.ops.requestingDelete ||
          ctrl.ops.undoingRequestDelete
        }
      />

      <DocumentDialog
        open={dialog.open}
        mode={dialog.mode}
        doc={dialog.doc}
        loading={dialog.mode === "edit" ? ctrl.ops.updating : ctrl.ops.creating}
        onClose={ctrl.actions.closeDialog}
        onSubmit={onDialogSubmit}
      />
    </>
  );
}
