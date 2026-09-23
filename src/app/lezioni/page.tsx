"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LessonsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/materiali");
  }, [router]);

  return (
    <main className="atlas-page">
      <p>Reindirizzamento ai materiali didattici…</p>
    </main>
  );
}
