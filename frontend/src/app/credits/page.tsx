"use client";

// Old "Credits" route now redirects to the new Subscriptions page,
// which uses Safal Tokens wording per the new user stories.

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CreditsRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/subscriptions");
  }, [router]);

  return null;
}
