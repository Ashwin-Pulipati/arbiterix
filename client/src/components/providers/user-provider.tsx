"use client";

import React, { createContext, useContext, useEffect, useMemo, useSyncExternalStore, useCallback } from "react";
import { User } from "@/types";
import { useAsyncFn } from "react-use";
import { api } from "@/lib/api";

const defaultUser: User = { id: 1, username: "demo", role: "user", tenant: "default" };

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  availableUsers: User[];
  refetchUsers: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const userStorageEvent = new EventTarget();

const subscribe = (callback: () => void) => {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  userStorageEvent.addEventListener("change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    userStorageEvent.removeEventListener("change", handler);
  };
};

const getSnapshot = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("arbiter_user");
};

const getServerSnapshot = () => null;

export function UserProvider({ children }: { readonly children: React.ReactNode }) {
  const storedString = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const user = useMemo(() => {
    if (storedString) {
      try {
        return JSON.parse(storedString) as User;
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
    return defaultUser;
  }, [storedString]);

  const setUser = useCallback((newUser: User) => {
    try {
      localStorage.setItem("arbiter_user", JSON.stringify(newUser));
      userStorageEvent.dispatchEvent(new Event("change"));
    } catch (e) {
      console.error("Failed to save user to local storage", e);
    }
  }, []);
  
  const [usersState, fetchUsers] = useAsyncFn(async () => {
    const currentUser = user;
    try {
      const users = await api.users.list(currentUser);
      // Ensure the current user is in the list, if not add it.
      if (!users.find(u => u.id === currentUser.id)) {
        return [currentUser, ...users];
      }
      return users;
    } catch (e) {
      return [currentUser];
    }
  }, [user]);
  
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const availableUsers = useMemo(() => usersState.value || [], [usersState.value]);

  useEffect(() => {
    if (availableUsers.length > 0 && user) {
      if (!availableUsers.find(u => u.id === user.id)) {
        setUser(availableUsers[0]);
      }
    }
  }, [availableUsers, user, setUser]);
  
  const displayUsers = useMemo(() => {
    if (usersState.loading) return [user];
    return availableUsers.length > 0 ? availableUsers : [user];
  }, [user, availableUsers, usersState.loading]);

  const value = useMemo(() => ({
    user,
    setUser,
    availableUsers: displayUsers,
    refetchUsers: fetchUsers,
  }), [user, setUser, displayUsers, fetchUsers]);

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