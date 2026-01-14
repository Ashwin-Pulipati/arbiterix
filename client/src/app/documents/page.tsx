"use client";

import { useState } from "react";
import { useAsync, useAsyncFn } from "react-use";
import { Shell } from "@/components/layout/shell";
import { api } from "@/lib/api";
import { useUser } from "@/components/providers/user-provider";
import { DocumentCreate, Document } from "@/types";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Plus, Trash2, FileText, Search, ShieldAlert, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

const formatDate = (dateString?: string) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  
  let hh = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = hh >= 12 ? 'PM' : 'AM';
  hh = hh % 12;
  hh = hh ? hh : 12; // the hour '0' should be '12'
  const hhStr = String(hh).padStart(2, '0');

  return `${mm}-${dd}-${yyyy} ${hhStr}:${min} ${ampm}`;
};

export default function DocumentsPage() {
  const { user } = useUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);

  const [documentsState, fetchDocuments] = useAsyncFn(async () => {
    return api.documents.list(user);
  }, [user]);

  // Initial fetch
  useAsync(fetchDocuments, [fetchDocuments]);

  const [deleteState, deleteDocument] = useAsyncFn(async (id: number) => {
    try {
      await api.documents.delete(id, user);
      toast.success("Document deleted");
      fetchDocuments();
    } catch {
      toast.error("Failed to delete document");
    }
  }, [user, fetchDocuments]);

  const [requestDeleteState, requestDeleteDocument] = useAsyncFn(async (id: number) => {
    try {
      await api.documents.requestDelete(id, user);
      toast.success("Deletion requested");
      fetchDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to request deletion";
      toast.error(message);
    }
  }, [user, fetchDocuments]);

  const [createState, createDocument] = useAsyncFn(async (data: DocumentCreate) => {
    await api.documents.create(data, user);
    toast.success("Document created");
    setIsDialogOpen(false);
    fetchDocuments();
  }, [user, fetchDocuments]);

  const [updateState, updateDocument] = useAsyncFn(async (data: DocumentCreate) => {
    if (!editingDoc) return;
    try {
      await api.documents.update(editingDoc.id, data, user);
      toast.success("Document updated");
      setIsDialogOpen(false);
      setEditingDoc(null);
      fetchDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update document";
      toast.error(message);
    }
  }, [user, editingDoc, fetchDocuments]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (editingDoc) {
      updateDocument(values);
    } else {
      createDocument(values);
    }
    form.reset();
  }

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    form.setValue("title", doc.title);
    form.setValue("content", doc.content);
    setIsDialogOpen(true);
  };

  const handleCreateOpen = () => {
    setEditingDoc(null);
    form.reset();
    setIsDialogOpen(true);
  };

  const filteredDocs = (documentsState.value || []).filter((doc: Document) => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Shell>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold font-display text-gradient">Documents</h2>
          <p className="text-muted-foreground">
            Manage your secure documents vault.
          </p>
        </div>
        <Button className="shadow-lg shadow-primary/20" onClick={handleCreateOpen}>
          <Plus className="mr-2 h-4 w-4" /> Add Document
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setEditingDoc(null);
            form.reset();
          }
        }}>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>{editingDoc ? "Edit Document" : "Add Document"}</DialogTitle>
              <DialogDescription>
                {editingDoc ? "Update existing document details." : "Create a new document in your secure vault."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project Alpha specs..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea 
                            placeholder="Confidential details here..." 
                            className="min-h-[150px]"
                            {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createState.loading || updateState.loading}>
                    {(createState.loading || updateState.loading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingDoc ? "Update Document" : "Save Document"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-2 bg-card p-1 rounded-lg border w-fit">
        <div className="pl-3">
            <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <Input 
            placeholder="Search documents..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 w-[300px]"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Preview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">ID</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documentsState.loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocs.map((doc: Document) => (
                  <TableRow key={doc.id} className="group">
                    <TableCell>
                         <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </TableCell>
                    <TableCell className="font-medium">{doc.title}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{doc.owner_username}</TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {doc.content}
                    </TableCell>
                    <TableCell>
                        {doc.status === "delete_requested" && (
                            <Badge variant="destructive" className="text-[10px] px-1 py-0 h-5">
                                Deletion Requested
                            </Badge>
                        )}
                        {doc.status === "updated" && (
                             <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-blue-500/10 text-blue-700 border-blue-500/20">
                                Updated
                            </Badge>
                        )}
                        {doc.status === "created" && (
                             <Badge variant="outline" className="text-[10px] px-1 py-0 h-5 bg-green-500/10 text-green-700 border-green-500/20">
                                New
                            </Badge>
                        )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(doc.created_at)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(doc.updated_at)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground text-xs font-mono">{doc.id}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(doc)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary hover:bg-primary/10"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>

                        {user.role === "admin" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => deleteDocument(doc.id)}
                            disabled={deleteState.loading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : (
                          !doc.delete_requested && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                              onClick={() => requestDeleteDocument(doc.id)}
                              disabled={requestDeleteState.loading}
                              title="Request Deletion"
                            >
                              <ShieldAlert className="h-4 w-4" />
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
        </CardContent>
      </Card>
    </Shell>
  );
}