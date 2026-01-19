"use client";

import React, { createContext, useContext, useEffect, useMemo } from "react";
import { User } from "@/types";
import { useAsyncFn, useLocalStorage } from "react-use";
import { api } from "@/lib/api";

const defaultUser: User = { id: 1, username: "demo", role: "user", tenant: "default" };

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  availableUsers: User[];
  refetchUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User>("arbiter_user", defaultUser);
  
  const [usersState, fetchUsers] = useAsyncFn(async () => {
    const currentUser = user || defaultUser;
    if (currentUser.role === 'admin') {
      try {
        const users = await api.users.list(currentUser);
        // Ensure the current user is in the list, if not add it.
        if (!users.find(u => u.id === currentUser.id)) {
          return [currentUser, ...users];
        }
        return users;
      } catch (e) {
        // if the call fails (e.g. for non-admins), just return the current user
        return [currentUser];
      }
    }
    return [currentUser]; // for non-admin users, only show themselves
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const availableUsers = usersState.value || [];

  useEffect(() => {
    if (availableUsers && availableUsers.length > 0 && user) {
      if (!availableUsers.find(u => u.id === user.id)) {
        setUser(availableUsers[0]);
      }
    }
  }, [availableUsers, user, setUser]);
  
  const value = useMemo(() => ({
    user: user || defaultUser,
    setUser,
    availableUsers: usersState.loading ? [user || defaultUser] : availableUsers || [user || defaultUser],
    refetchUsers: fetchUsers,
  }), [user, setUser, availableUsers, usersState.loading, fetchUsers]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
