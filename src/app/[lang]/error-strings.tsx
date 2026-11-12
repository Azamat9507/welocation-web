"use client";

import { createContext, useContext, type ReactNode } from "react";

type Strings = { message: string; retry: string };

// error.tsx is a client boundary without props; the layout hands it just these two strings
const Context = createContext<Strings>({ message: "", retry: "" });

export function ErrorStrings({ value, children }: { value: Strings; children: ReactNode }) {
  return <Context value={value}>{children}</Context>;
}

export const useErrorStrings = () => useContext(Context);
