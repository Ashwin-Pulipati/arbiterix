"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Document } from "@/types";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

type FormValues = z.infer<typeof schema>;

export function DocumentDialog({
  open,
  mode,
  doc,
  loading,
  onClose,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  doc?: Document;
  loading: boolean;
  onClose: () => void;
  onSubmit: (v: FormValues) => void;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", content: "" },
  });

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && doc) {
      form.reset({ title: doc.title, content: doc.content || "" });
    } else {
      form.reset({ title: "", content: "" });
    }
  }, [open, mode, doc, form]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-[560px] surface">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Document" : "Add Document"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Update existing document details." : "Create a new document in your secure vault."}
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
                    <Input {...field} className="focus-ring" placeholder="Project Alpha specs..." />
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
                    <Textarea {...field} className="min-h-[170px] focus-ring" placeholder="Confidential details here..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} className="focus-ring">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="focus-ring">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {mode === "edit" ? "Update" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
