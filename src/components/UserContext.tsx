"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  points: number;
  setPoints: (points: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [points, setPoints] = useState(0);

  return (
    <UserContext.Provider value={{ points, setPoints }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
