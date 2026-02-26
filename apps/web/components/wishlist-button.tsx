"use client";

import { Bookmark } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export function WishlistButton({ jobId, className }: { jobId: Id<"jobs">; className?: string }) {
  const toggleWishlist = useMutation(api.wishlist.toggle);
  const isWishlisted = useQuery(api.wishlist.isWishlisted, { jobId });

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await toggleWishlist({ jobId });
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className={className || "p-2 hover:bg-neutral-bg-secondary rounded-lg transition-colors"}
      title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Bookmark
        className={`w-5 h-5 ${isWishlisted ? 'fill-brand-orange text-brand-orange' : 'text-neutral-text-secondary'}`}
      />
    </button>
  );
}
