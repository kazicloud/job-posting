"use client";

import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";

export function ConvexClerkSync() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const syncUser = useMutation(api.users.syncUser);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (!isClerkLoaded || !isAuthenticated || !user || synced) return;

    const sync = async () => {
      try {
        await syncUser({
          clerkId: user.id,
          email: user.primaryEmailAddress?.emailAddress || "",
          fullName: user.fullName || undefined,
          profilePhoto: user.imageUrl || undefined,
        });
        
        setSynced(true);
      } catch (error) {
        console.error("Failed to sync user:", error);
      }
    };

    sync();
  }, [isClerkLoaded, isAuthenticated, user, syncUser, synced]);

  return null;
}
