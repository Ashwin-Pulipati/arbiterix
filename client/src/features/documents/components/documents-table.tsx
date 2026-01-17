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
              <TableRow key={doc.id} className="group">
                <TableCell>
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" aria-hidden="true" />
                </TableCell>
                <TableCell className="font-medium">{doc.title}</TableCell>
                <TableCell className="text-muted-foreground text-sm">{doc.owner_username}</TableCell>
                <TableCell className="text-muted-foreground max-w-[220px] truncate">{doc.content}</TableCell>
                <TableCell>
                  {doc.status === "delete_requested" && (
                    <Badge variant="destructive" className="text-[10px] px-2 py-0 h-5">
                      Deletion Requested
                    </Badge>
                  )}
                  {doc.status === "updated" && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-blue-500/10 text-blue-700 border-blue-500/20">
                      Updated
                    </Badge>
                  )}
                  {doc.status === "created" && (
                    <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-green-500/10 text-green-700 border-green-500/20">
                      New
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(doc.created_at)}</TableCell>
                <TableCell className="text-muted-foreground text-xs whitespace-nowrap">{formatDate(doc.updated_at)}</TableCell>
                <TableCell className="text-right text-muted-foreground text-xs font-mono">{doc.id}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(doc)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10 focus-ring"
                      aria-label={`Edit ${doc.title}`}
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </Button>

                    {user.role === "admin" ? (
                      doc.delete_requested ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onUndoRequestDelete(doc.id)}
                          disabled={disableActions}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-500 hover:text-green-600 hover:bg-green-500/10 focus-ring"
                          aria-label={`Undo deletion request for ${doc.title}`}
                        >
                          <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(doc.id)}
                          disabled={disableActions}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 focus-ring"
                          aria-label={`Delete ${doc.title}`}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )
                    ) : (
                      !doc.delete_requested && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRequestDelete(doc.id)}
                          disabled={disableActions}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-500/10 focus-ring"
                          aria-label={`Request deletion for ${doc.title}`}
                        >
                          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
