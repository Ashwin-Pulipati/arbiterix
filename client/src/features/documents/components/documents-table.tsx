"use client";

import type { Document, User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Pencil, ShieldAlert, ShieldCheck, Trash2 } from "lucide-react";

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const yyyy = date.getFullYear();
  let hh = date.getHours();
  const min = String(date.getMinutes()).padStart(2, "0");
  const ampm = hh >= 12 ? "PM" : "AM";
  hh = hh % 12;
  hh = hh ? hh : 12;
  const hhStr = String(hh).padStart(2, "0");
  return `${mm}-${dd}-${yyyy} ${hhStr}:${min} ${ampm}`;
};

import { DocumentRow } from "./document-row";

export function DocumentsTable({
  user,
  loading,
  documents,
  onEdit,
  onDelete,
  onRequestDelete,
  onUndoRequestDelete,
  disableActions,
}: {
  user: User;
  loading: boolean;
  documents: Document[];
  onEdit: (d: Document) => void;
  onDelete: (id: number) => void;
  onRequestDelete: (id: number) => void;
  onUndoRequestDelete: (id: number) => void;
  disableActions: boolean;
}) {
  return (
    <div className="surface overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[44px]" />
            <TableHead>Title</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Preview</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">ID</TableHead>
            <TableHead className="w-[132px]" />
          </TableRow>
        </TableHeader>

        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                Loading…
              </TableCell>
            </TableRow>
          ) : documents.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                No documents found.
              </TableCell>
            </TableRow>
          ) : (
            documents.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onRequestDelete={onRequestDelete}
                onUndoRequestDelete={onUndoRequestDelete}
                disableActions={disableActions}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
