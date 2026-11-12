import { notFound } from "next/navigation";

// Unknown paths under a locale get the localized not-found page inside the layout
export default function CatchAll() {
  notFound();
}
