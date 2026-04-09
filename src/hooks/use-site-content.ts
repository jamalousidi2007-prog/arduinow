"use client";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  defaultEditableContent,
  localizedContent,
} from "@/lib/site-content";
import type { EditableContent, Locale } from "@/lib/types";

export function useSiteContent(locale: Locale) {
  const [content, setContent] = useState<EditableContent>(defaultEditableContent);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = doc(db, "siteContent", "main");
    const unsub = onSnapshot(
      ref,
      (snapshot) => {
        if (!snapshot.exists()) {
          setContent(defaultEditableContent);
          setLoading(false);
          return;
        }

        const raw = snapshot.data() as Partial<EditableContent>;
        setContent({
          ...defaultEditableContent,
          ...raw,
        });
        setLoading(false);
      },
      () => {
        setContent(defaultEditableContent);
        setLoading(false);
      },
    );

    return () => unsub();
  }, []);

  return {
    content,
    localized: localizedContent(content, locale),
    loading,
  };
}

