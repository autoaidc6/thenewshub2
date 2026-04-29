// netlify/functions/youtube.js
// ─────────────────────────────────────────────────────────────────────────────
// Fetches YouTube RSS feeds server-side — bypasses CORS blocking.
// Endpoint: /.netlify/functions/youtube?channelId=CHANNEL_ID&count=6
// Returns:  { items: [ { title, videoId, thumbnail, publishedAt, channelName, url } ] }
// ─────────────────────────────────────────────────────────────────────────────

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
    "Cache-Control": "public, max-age=900", // cache 15 mins
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const { channelId, count = "6" } = event.queryStringParameters || {};

  if (!channelId) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Missing channelId" }) };
  }

  try {
    const feedUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RSS reader)",
        "Accept": "application/atom+xml, application/xml, text/xml, */*",
      },
    });

    if (!res.ok) throw new Error(`YouTube feed returned ${res.status}`);

    const xml = await res.text();
    const items = parseYouTubeAtom(xml, parseInt(count));

    return { statusCode: 200, headers, body: JSON.stringify({ items }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message, items: [] }) };
  }
}

// ─── XML PARSER ───────────────────────────────────────────────────────────────
function parseYouTubeAtom(xml, maxCount = 6) {
  const items = [];

  // Extract channel name
  const channelName = getText(xml, "title", true) || "YouTube";

  // Split into entries
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null && items.length < maxCount) {
    const entry = match[1];

    // Video ID — in YouTube feeds it's in <yt:videoId>
    const videoId = getTag(entry, "yt:videoId")
      || getTag(entry, "videoId")
      || "";

    if (!videoId) continue;

    const title       = decodeHtml(getTag(entry, "title") || "");
    const published   = getTag(entry, "published") || getTag(entry, "updated") || "";
    const description = decodeHtml(
      getTag(entry, "media:description")
      || getTag(entry, "description")
      || ""
    ).slice(0, 200);

    // Thumbnail — YouTube provides this in media:group
    const thumbnail = getAttr(entry, "media:thumbnail", "url")
      || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    // Skip only if title is EXACTLY "#shorts" or "#short" (standalone)
    // Many compilation channels tag their LONG videos with #shorts in description
    // so we only filter the title — and only if it's the WHOLE title or ends with it
    const t = title.toLowerCase().trim();
    if (t === '#shorts' || t === '#short' || t === 'shorts' || t === 'short') continue;

    items.push({
      videoId,
      title,
      description,
      thumbnail,
      url,
      channelName,
      publishedAt: published,
    });
  }

  return items;
}

function getTag(xml, tag) {
  // Handle namespaced tags like yt:videoId, media:thumbnail
  const escaped = tag.replace(":", ":");
  const regex = new RegExp(`<${escaped}[^>]*>([^<]*)<\\/${escaped}>`, "i");
  const m = xml.match(regex);
  return m ? m[1].trim() : null;
}

function getAttr(xml, tag, attr) {
  const escaped = tag.replace(":", ":");
  const regex = new RegExp(`<${escaped}[^>]*${attr}=["']([^"']+)["']`, "i");
  const m = xml.match(regex);
  return m ? m[1] : null;
}

function getText(xml, tag, first = false) {
  const regex = new RegExp(`<${tag}[^>]*>([^<]+)<\\/${tag}>`, "gi");
  const m = regex.exec(xml);
  return m ? m[1].trim() : null;
}

function decodeHtml(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
}
