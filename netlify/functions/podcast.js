// netlify/functions/podcast.js
// Fetches a podcast RSS feed server-side (no CORS issues) and returns the latest episode
// Usage: /.netlify/functions/podcast?url=https://feeds.npr.org/510318/podcast.xml

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const feedUrl = event.queryStringParameters?.url;
  if (!feedUrl) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing url param" }) };
  }

  try {
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; TheNews/1.0; +https://thenewsHub.org)",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ error: `Feed returned ${res.status}` }) };
    }

    const xml = await res.text();

    // ── Parse XML manually (no DOM in Node, use regex for key fields) ──────────
    const getText = (str, tag) => {
      // Handle both namespaced and plain tags
      const patterns = [
        new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, "i"),
        new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
      ];
      for (const p of patterns) {
        const m = str.match(p);
        if (m?.[1]?.trim()) return m[1].trim();
      }
      return "";
    };

    const getAttr = (str, tag, attr) => {
      const m = str.match(new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`, "i"));
      return m?.[1] || "";
    };

    // Channel-level info (everything before first <item>)
    const channelPart = xml.split(/<item[\\s>]/i)[0] || xml;

    const podcastTitle = getText(channelPart, "title") || new URL(feedUrl).hostname;

    // Artwork: itunes:image href or <image><url>
    const itunesImgHref = getAttr(channelPart, "itunes:image", "href");
    const imageUrl = getAttr(channelPart, "image", "href") ||
                     itunesImgHref ||
                     getText(channelPart.replace(/.*<image>/s, "<image>").split("</image>")[0], "url") ||
                     "";

    // Split into items
    const itemMatches = [...xml.matchAll(/<item[\s>]([\s\S]*?)<\/item>/gi)];

    for (const match of itemMatches) {
      const item = match[1];

      // Get enclosure URL
      const encUrl  = getAttr(item, "enclosure", "url");
      const encType = getAttr(item, "enclosure", "type");

      // Accept any audio enclosure
      const isAudio = encUrl && (
        encType.includes("audio") ||
        encUrl.includes(".mp3") ||
        encUrl.includes(".m4a") ||
        encUrl.includes(".aac") ||
        encUrl.includes("audio") ||
        encUrl.includes("megaphone") ||
        encUrl.includes("simplecast") ||
        encUrl.includes("acast") ||
        encUrl.includes("pdst.fm") ||
        encUrl.includes("chtbl") ||
        encUrl.includes("podtrac") ||
        encUrl.includes("omny") ||
        encUrl.includes("npr.org") ||
        encUrl.includes("bbc") ||
        encUrl.includes("spreaker") ||
        encUrl.includes("art19")
      );

      if (!isAudio) continue;

      const epTitle  = getText(item, "title");
      const pubDate  = getText(item, "pubDate");
      const guid     = getText(item, "guid") || encUrl;
      const rawDesc  = getText(item, "description") || getText(item, "itunes:summary") || "";
      const desc     = rawDesc.replace(/<[^>]*>/g, "").replace(/&[^;]+;/g, " ").trim().slice(0, 250);
      let   duration = getText(item, "itunes:duration") || "";

      // Convert seconds to mm:ss if needed
      if (duration && /^\\d+$/.test(duration)) {
        const s = parseInt(duration);
        duration = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          podcast:     podcastTitle,
          title:       epTitle || podcastTitle,
          description: desc,
          mp3:         encUrl,
          duration,
          publishedAt: pubDate || new Date().toISOString(),
          image:       imageUrl,
          guid,
        }),
      };
    }

    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: "No audio episode found in feed" }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message }),
    };
  }
}
