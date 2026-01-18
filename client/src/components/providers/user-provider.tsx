"use client";

import React, { createContext, useContext, useMemo } from "react";
import { User } from "@/types";
import { useLocalStorage } from "react-use";

const MOCK_USERS: User[] = [
  { id: 1, username: "demo", role: "user", tenant: "default" },
  { id: 2, username: "admin", role: "admin", tenant: "default" },
  { id: 99, username: "new_user", role: "user", tenant: "client-a" },
];

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  availableUsers: User[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { readonly children: React.ReactNode }) {
  const [user, setUser] = useLocalStorage<User>("arbiter_user", MOCK_USERS[0]);

  const value = useMemo(() => ({
    user: user || MOCK_USERS[0],
    setUser,
    availableUsers: MOCK_USERS,
  }), [user, setUser]);

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
