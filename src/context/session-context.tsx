// context/session-context.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { 
  Session as SessionRecord, // This is the database session record
  User as UserRecord 
} from 'better-auth'; 

// 1. Define the type of the context value
export interface FullSession {
  session: SessionRecord;
  user: UserRecord;
}

// 2. Create the context
const SessionContext = createContext<FullSession | undefined>(undefined);

// 3. Define the Provider component
// It accepts the session data fetched from the server component (MainLayout)
interface SessionProviderProps {
  children: ReactNode;
  initialSession: FullSession; // The session fetched in the server component
}

export function SessionProvider({ children, initialSession }: SessionProviderProps) {
  return (
    <SessionContext.Provider value={{ session: initialSession }}>
      {children}
    </SessionContext.Provider>
  );
}

// 4. Define the Hook for consumer components
export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}