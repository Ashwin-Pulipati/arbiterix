"use client";

import * as React from "react";
import {
  MoreHorizontal,
  Shield,
  ShieldAlert,
  Trash2,
  KeyRound,
  User,
} from "lucide-react";
import { User as UserType } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UsersTableProps {
  readonly users: UserType[];
  readonly currentUser: UserType;
  readonly onDelete: (id: number) => Promise<void>;
  readonly onUpdateRole: (id: number, role: "admin" | "user") => Promise<void>;
  readonly onResetPassword: (id: number, password: string) => Promise<void>;
}

export function UsersTable({
  users,
  currentUser,
  onDelete,
  onUpdateRole,
  onResetPassword,
}: UsersTableProps) {
  const [deleteId, setDeleteId] = React.useState<number | null>(null);
  const [resetId, setResetId] = React.useState<number | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await onDelete(deleteId);
      setDeleteId(null);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetId || !newPassword) return;
    setLoading(true);
    try {
      await onResetPassword(resetId, newPassword);
      setResetId(null);
      setNewPassword("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {user.username}
                    {user.id === currentUser.id && (
                      <Badge variant="outline" className="ml-2">
                        You
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "admin" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell>{user.tenant}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0"
                        disabled={loading}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() =>
                          onUpdateRole(
                            user.id,
                            user.role === "admin" ? "user" : "admin"
                          )
                        }
                        disabled={user.id === currentUser.id}
                      >
                        {user.role === "admin" ? (
                          <>
                            <Shield className="mr-2 h-4 w-4" />
                            Demote to User
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="mr-2 h-4 w-4" />
                            Promote to Admin
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setResetId(user.id)}>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(user.id)}
                        disabled={user.id === currentUser.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteId(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
            >
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!resetId} onOpenChange={(open) => !open && setResetId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter a new password for this user.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetId(null)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={loading || !newPassword}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
