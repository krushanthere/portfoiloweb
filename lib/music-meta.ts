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
 * Cleanly formats a song title from a URL path.
 */
function cleanTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split("/").pop() || "Audio Track";
    const withoutExt = filename.replace(/\.[^/.]+$/, "");
    const decoded = decodeURIComponent(withoutExt).replace(/[-_]/g, " ");
    return decoded
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  } catch {
    return "Custom Audio Track";
  }
}

/**
 * Automatically extracts YouTube video title, channel name, and high-res thumbnail,
 * or parses direct audio streaming URLs.
 */
export async function resolveMusicUrl(url: string): Promise<ResolvedMusicMetadata> {
  const u = url.trim();
  const fallbackId = `track-${Date.now()}`;

  // Check for direct audio file formats (.mp3, .wav, .ogg, .m4a, .aac, .flac)
  const isDirectAudio = /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(u) || u.startsWith("data:audio/");
  if (isDirectAudio) {
    return {
      id: fallbackId,
      title: cleanTitleFromUrl(u),
      artist: "Direct Audio Stream",
      coverUrl: "/images/disc-infinity.png",
      type: "audio",
      audioUrl: u,
    };
  }

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
    const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&autoplay=1&playsinline=1&controls=1`;
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
      // Fallback to default YouTube metadata
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

  // If unknown URL, treat as audio URL if it starts with http, or fallback to default track
  if (u.startsWith("http://") || u.startsWith("https://")) {
    return {
      id: fallbackId,
      title: cleanTitleFromUrl(u),
      artist: "Web Audio Stream",
      coverUrl: "/images/disc-infinity.png",
      type: "audio",
      audioUrl: u,
    };
  }

  // Fallback default
  return {
    id: fallbackId,
    title: "Infinity (8th Anniversary)",
    artist: "Krushanta • Lo-Fi Beats",
    coverUrl: "/images/disc-infinity.png",
    type: "audio",
    audioUrl: "/audio/infinity-lofi.wav",
  };
}
