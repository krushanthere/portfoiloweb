import type { Metadata } from "next";
import { DiscPlayer } from "@/components/DiscPlayer";

export const metadata: Metadata = {
  title: "DiscPlayer // Minimalist Vinyl Music Experience",
  description: "Interactive spinning vinyl disc player for Apple Music, Spotify, YouTube Music, and personal audio streams.",
};

export default function PlayerPage() {
  return <DiscPlayer />;
}
