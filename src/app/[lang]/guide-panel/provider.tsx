"use client";

import { createContext, Suspense, useCallback, useContext, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Dictionary } from "@/lib/dictionaries";
import { splitLocale, type Locale } from "@/lib/i18n";
import { askGuide } from "../guide/actions";
import type { GuideState } from "../guide/types";
import { GuidePanelContext, type GuidePanelApi } from "./context";
import { GuidePanel } from "./panel";

export type GuideLabels = {
  panel: Dictionary["guide"]["panel"];
  form: Dictionary["guide"]["form"];
  connect: string;
  categories: Dictionary["categories"];
  regions: Dictionary["regions"];
};

export type Message =
  | { id: number; from: "user"; text: string }
  | { id: number; from: "guide"; reply: Omit<GuideState, "question"> };

type Chat = {
  lang: Locale;
  labels: GuideLabels;
  messages: Message[];
  pending: boolean;
  draft: string;
  setDraft: (v: string) => void;
  send: (question: string) => void;
  reset: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
};

const ChatContext = createContext<Chat | null>(null);

export function useGuideChat() {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useGuideChat outside GuidePanelProvider");
  return chat;
}

// sessionStorage, so the conversation follows the visitor across pages but not across tabs or visits
const KEY = "wl-guide-chat";
const MAX_MESSAGES = 20;
const EMPTY: Message[] = [];
let cache: Message[] | null = null;
const listeners = new Set<() => void>();

function readMessages(): Message[] {
  if (cache) return cache;
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(stored) ? (stored as Message[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function writeMessages(next: Message[]) {
  cache = next.slice(-MAX_MESSAGES);
  try {
    if (cache.length > 0) sessionStorage.setItem(KEY, JSON.stringify(cache));
    else sessionStorage.removeItem(KEY);
  } catch {
    // private mode or a full quota: the conversation still works for this page
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let nextId = Date.now();

export function GuidePanelProvider({ lang, labels, children }: { lang: Locale; labels: GuideLabels; children: ReactNode }) {
  // the server render has no sessionStorage: it renders an empty conversation and the client fills it in after hydration
  const messages = useSyncExternalStore(subscribe, readMessages, () => EMPTY);
  const [pending, setPending] = useState(false);
  const [draft, setDraft] = useState("");
  const [isOpen, setOpen] = useState(false);
  const busy = useRef(false);

  const send = useCallback(
    async (raw: string) => {
      const question = raw.trim();
      if (!question || busy.current) return;
      busy.current = true;
      setPending(true);
      setDraft("");
      writeMessages([...readMessages(), { id: nextId++, from: "user", text: question }]);
      let reply: GuideState;
      try {
        const form = new FormData();
        form.set("lang", lang);
        form.set("question", question);
        reply = await askGuide({}, form);
      } catch {
        reply = { error: labels.connect };
      }
      writeMessages([
        ...readMessages(),
        { id: nextId++, from: "guide", reply: { error: reply.error, login: reply.login, result: reply.result } },
      ]);
      busy.current = false;
      setPending(false);
    },
    [lang, labels.connect],
  );

  const reset = useCallback(() => {
    if (busy.current) return;
    writeMessages([]);
    setDraft("");
  }, []);

  const api = useMemo<GuidePanelApi>(
    () => ({
      open: () => setOpen(true),
      ask: (question) => {
        // the guide page shows the same conversation full width, so the panel stays closed there
        if (splitLocale(window.location.pathname).rest !== "/guide") setOpen(true);
        if (busy.current) setDraft(question);
        else void send(question);
      },
    }),
    [send],
  );

  const chat = useMemo<Chat>(
    () => ({
      lang,
      labels,
      messages,
      pending,
      draft,
      setDraft,
      send: (q) => void send(q),
      reset,
      isOpen,
      open: api.open,
      close: () => setOpen(false),
    }),
    [lang, labels, messages, pending, draft, send, reset, isOpen, api.open],
  );

  return (
    <GuidePanelContext value={api}>
      <ChatContext value={chat}>
        {children}
        {/* the panel reads the pathname, which is request data on pages with unknown params */}
        <Suspense fallback={null}>
          <GuidePanel />
        </Suspense>
      </ChatContext>
    </GuidePanelContext>
  );
}
