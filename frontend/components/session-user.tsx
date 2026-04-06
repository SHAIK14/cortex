"use client";

import { createContext, useContext } from "react";

export type SessionUser = {
  id: string;
  email: string;
  accessToken: string;
};

const SessionUserContext = createContext<SessionUser | null>(null);

export function SessionUserProvider({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  return (
    <SessionUserContext.Provider value={user}>
      {children}
    </SessionUserContext.Provider>
  );
}

export function useSessionUser() {
  const user = useContext(SessionUserContext);
  if (!user) {
    throw new Error("useSessionUser must be used inside SessionUserProvider");
  }
  return user;
}
