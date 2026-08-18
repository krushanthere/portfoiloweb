export interface ResolvedMusicMetadata {
  id: string;
  title: string;
  artist: string;
  coverUrl?: string;
  type: "youtube" | "audio";
  embedUrl?: string;
  videoId?: string;
  audioUrl?: string;
}

/**
 * Automatically extracts YouTube video title, channel name, and high-res thumbnail.
 */
export async function resolveMusicUrl(url: string): Promise<ResolvedMusicMetadata> {
  const u = url.trim();
  const fallbackId = `yt-${Date.now()}`;

  // Extract YouTube video ID
  let videoId = "";
  if (u.includes("youtu.be/")) {
    videoId = u.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0] || "";
  } else if (u.includes("youtube.com/watch") || u.includes("music.youtube.com/watch")) {
    try {
      const urlObj = new URL(u);
      videoId = urlObj.searchParams.get("v") || "";
    } catch {
      const match = u.match(/[?&]v=([^&#]+)/);
      videoId = match ? match[1] : "";
    }
  } else if (u.includes("youtube.com/embed/")) {
    videoId = u.split("youtube.com/embed/")[1]?.split("?")[0] || "";
  } else if (u.includes("youtube.com/shorts/")) {
    videoId = u.split("youtube.com/shorts/")[1]?.split("?")[0] || "";
  } else if (/^[a-zA-Z0-9_-]{11}$/.test(u)) {
    // Direct 11-char YouTube video ID
    videoId = u;
  }

  if (videoId) {
    const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`;
    const fallbackCover = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      if (res.ok) {
        const data = await res.json();
        return {
          id: fallbackId,
          title: data.title || "YouTube Track",
          artist: data.author_name || "YouTube Creator",
          coverUrl: data.thumbnail_url || fallbackCover,
          type: "youtube",
          embedUrl,
          videoId,
        };
      }
    } catch {
      // Fallback
    }

    return {
      id: fallbackId,
      title: "YouTube Track",
      artist: "YouTube",
      coverUrl: fallbackCover,
      type: "youtube",
      embedUrl,
      videoId,
    };
  }

  // Fallback if URL is not a standard YouTube link
  return {
    id: fallbackId,
    title: "Infinity (8th Anniversary)",
    artist: "Free Fire",
    coverUrl: "/images/disc-infinity.png",
    type: "youtube",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1",
  };
}
