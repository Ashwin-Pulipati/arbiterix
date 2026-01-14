"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@/types";
import { useLocalStorage } from "react-use";

// Mock users matching backend expectations
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

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [storedUser, setStoredUser] = useLocalStorage<User>("arbiter_user", MOCK_USERS[0]);
  const [user, setUserState] = useState<User>(MOCK_USERS[0]);

  // Sync with local storage on mount
  useEffect(() => {
    if (storedUser) {
      setUserState(storedUser);
    }
  }, [storedUser]);

  const setUser = (newUser: User) => {
    setUserState(newUser);
    setStoredUser(newUser);
  };

  return (
    <UserContext.Provider value={{ user, setUser, availableUsers: MOCK_USERS }}>
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
