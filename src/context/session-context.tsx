"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Session, User } from "better-auth/types";

// 1. Define the context value type
export interface FullSession {
  session: Session;
  user: User;
}

// 2. Create the context
const SessionContext = createContext<FullSession | undefined>(undefined);

// 3. Provider component
interface SessionProviderProps {
  children: ReactNode;
  initialSession: FullSession;
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={initialSession}>
      {children}
    </SessionContext.Provider>
  );
}




// 4. Consumer hook
export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
}
