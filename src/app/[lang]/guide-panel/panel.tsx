"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { splitLocale } from "@/lib/i18n";
import { Conversation } from "./conversation";
import { useGuideChat } from "./provider";

// Tailwind's sm breakpoint: below it the panel is a full-height sheet over the page
const PHONE = "(max-width: 639px)";

function subscribePhone(onChange: () => void) {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function useIsPhone() {
  return useSyncExternalStore(
    subscribePhone,
    () => window.matchMedia(PHONE).matches,
    () => false,
  );
}

export function GuidePanel() {
  const { labels, isOpen, open, close } = useGuideChat();
  const onGuidePage = splitLocale(usePathname()).rest === "/guide";
  const visible = isOpen && !onGuidePage;
  const isPhone = useIsPhone();
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const wasVisible = useRef(false);

  useEffect(() => {
    if (visible) {
      // on phones focusing the textarea would pop the keyboard over the answers
      if (isPhone) panelRef.current?.focus();
      else panelRef.current?.querySelector("textarea")?.focus();
    } else if (wasVisible.current) {
      launcherRef.current?.focus();
    }
    wasVisible.current = visible;
  }, [visible, isPhone]);

  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible, close]);

  useEffect(() => {
    if (!visible || !isPhone) return;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = before;
    };
  }, [visible, isPhone]);

  if (onGuidePage) return null;

  if (!visible) {
    return (
      <button
        ref={launcherRef}
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 flex items-center gap-1.5 rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:brightness-110 sm:right-6 sm:bottom-6"
      >
        <span aria-hidden="true">✨</span>
        {labels.panel.launcher}
      </button>
    );
  }

  return (
    <>
      <div aria-hidden="true" onClick={close} className="fixed inset-0 z-40 bg-black/30 sm:hidden" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal={isPhone || undefined}
        aria-label={labels.panel.title}
        tabIndex={-1}
        className="fixed inset-x-0 top-10 bottom-0 z-50 flex flex-col overflow-hidden rounded-t-2xl border border-line bg-background shadow-xl outline-none sm:inset-x-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[400px] sm:rounded-2xl"
      >
        {/* the sheet covers the whole phone screen, so a tapped spot would open behind it */}
        <Conversation onClose={close} onLeave={isPhone ? close : undefined} />
      </div>
    </>
  );
}
