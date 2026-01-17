"use client";

import { useEffect } from "react";
import { Shell } from "@/components/layout/shell";
import { useUser } from "@/components/providers/user-provider";
import { toast } from "sonner";
import { useTitle } from "react-use";
import { DocumentsToolbar } from "./components/documents-toolbar";
import { DocumentsTable } from "./components/documents-table";
import { DocumentDialog } from "./components/document-dialog";
import { useDocumentsController } from "./documents.controller";

export function DocumentsPage() {
  useTitle("Arbiter • Documents");

  const { user } = useUser();
  const ctrl = useDocumentsController(user);
  const { refresh } = ctrl.actions;

  useEffect(() => {
    refresh();
  }, [refresh]);

  const dialog = ctrl.state.dialog;

  return (
    <Shell>
      <DocumentsToolbar
        query={ctrl.state.query}
        onQueryChange={ctrl.setQuery}
        onCreate={ctrl.actions.openCreate}
      />

      <DocumentsTable
        user={user}
        loading={ctrl.listState.loading}
        documents={ctrl.documents}
        onEdit={(d) => ctrl.actions.openEdit(d)}
        onDelete={async (id) => {
          try {
            await ctrl.actions.deleteDoc(id);
            toast.success("Document deleted");
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Failed to delete document"
            );
          }
        }}
        onRequestDelete={async (id) => {
          try {
            await ctrl.actions.requestDeleteDoc(id);
            toast.success("Deletion requested");
          } catch (e) {
            toast.error(
              e instanceof Error ? e.message : "Failed to request deletion"
            );
          }
        }}
        onUndoRequestDelete={async (id) => {
          try {
            await ctrl.actions.undoRequestDeleteDoc(id);
            toast.success("Deletion request undone");
          } catch (e) {
            toast.error(
              e instanceof Error
                ? e.message
                : "Failed to undo deletion request"
            );
          }
        }}
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
        onSubmit={async (v) => {
          try {
            if (dialog.mode === "edit" && dialog.doc) {
              await ctrl.actions.updateDoc(dialog.doc.id, v);
              toast.success("Document updated");
            } else {
              await ctrl.actions.createDoc(v);
              toast.success("Document created");
            }
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Operation failed");
          }
        }}
      />
    </Shell>
  );
}
