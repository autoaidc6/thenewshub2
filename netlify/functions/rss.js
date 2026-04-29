// netlify/functions/rss.js
// ─────────────────────────────────────────────────────────────────────────────
// Own RSS proxy — replaces rss2json. No rate limits, no third-party dependency.
// Fetches any RSS/Atom feed server-side and returns clean JSON.
// Usage: /.netlify/functions/rss?url=https://feeds.bbci.co.uk/news/rss.xml&count=10
// ─────────────────────────────────────────────────────────────────────────────

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type":                 "application/json",
    "Cache-Control":                "public, max-age=600", // 10 min CDN cache
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers };
  }

  const { url, count = "10" } = event.queryStringParameters || {};

  if (!url) {
    return { statusCode: 400, headers, body: JSON.stringify({ status: "error", message: "Missing url" }) };
  }

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Thenews/1.0; +https://thenewshub.org)",
        "Accept":     "application/rss+xml, application/atom+xml, application/xml, text/xml, */*",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ status: "error", message: `Feed returned ${res.status}` }) };
    }

    const xml   = await res.text();
    const feed  = parseFeed(xml, parseInt(count));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ status: "ok", feed }),
    };

  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ status: "error", message: err.message }),
    };
  }
}

// ─── FEED PARSER ──────────────────────────────────────────────────────────────
function parseFeed(xml, maxCount = 10) {
  const isAtom = xml.includes("<feed") && xml.includes("xmlns");

  // ── Feed-level metadata ──────────────────────────────────────────────────
  const feedTitle = getCdata(xml, "title") || getText(xml, "title") || "";
  const feedImage = getAttr(xml, "image", "url")
    || getText(getBlock(xml, "image"), "url")
    || getAttr(xml, "itunes:image", "href")
    || "";

  const feed = {
    title: cleanText(feedTitle),
    image: feedImage,
    items: [],
  };

  // ── Split into items / entries ───────────────────────────────────────────
  const itemTag  = isAtom ? "entry" : "item";
  const blocks   = splitBlocks(xml, itemTag);

  for (const block of blocks) {
    if (feed.items.length >= maxCount) break;

    const item = parseItem(block, isAtom);
    if (item) feed.items.push(item);
  }

  return feed;
}

function parseItem(block, isAtom) {
  // Title
  const title = cleanText(getCdata(block, "title") || getText(block, "title") || "");
  if (!title) return null;

  // Link
  let link = "";
  if (isAtom) {
    link = getAttr(block, 'link[^>]*rel=["\']alternate["\']', "href")
        || getAttr(block, "link", "href")
        || getText(block, "link")
        || "";
  } else {
    link = getText(block, "link") || getAttr(block, "link", "href") || "";
  }

  // Guid / id
  const guid = getText(block, isAtom ? "id" : "guid") || link || title;

  // Description / summary — strip HTML tags
  const rawDesc = getCdata(block, "description")
    || getCdata(block, "content:encoded")
    || getCdata(block, "summary")
    || getText(block, "description")
    || getText(block, "summary")
    || getText(block, "content")
    || "";
  const description = stripHtml(rawDesc).slice(0, 400);

  // Date
  const pubDate = getText(block, isAtom ? "updated" : "pubDate")
    || getText(block, "published")
    || getText(block, "dc:date")
    || new Date().toISOString();

  // Author / source
  const author = getCdata(block, "author")
    || getText(block, "author")
    || getCdata(block, "dc:creator")
    || getText(block, "dc:creator")
    || "";

  // Image — try in order: media:content, media:thumbnail, enclosure, og:image in content
  let image = getAttr(block, "media:content", "url")
    || getAttr(block, "media:thumbnail", "url")
    || getAttr(block, 'enclosure[^>]*type=["\']image', "url");

  if (!image) {
    // Try to extract first img src from content
    const imgMatch = rawDesc.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch) image = imgMatch[1];
  }

  // Category
  const category = getCdata(block, "category") || getText(block, "category") || "";

  return {
    title,
    link:        link.trim(),
    guid:        guid.trim(),
    description,
    pubDate,
    author:      cleanText(author),
    image:       image || null,
    category,
  };
}

// ─── XML HELPERS ──────────────────────────────────────────────────────────────

// Split XML into blocks by tag
function splitBlocks(xml, tag) {
  const blocks = [];
  const re = new RegExp(`<${tag}[\\s>]([\\s\\S]*?)<\\/${tag}>`, "gi");
  let m;
  while ((m = re.exec(xml)) !== null) blocks.push(m[1]);
  return blocks;
}

// Get full block content between opening/closing tags
function getBlock(xml, tag) {
  const m = xml.match(new RegExp(`<${tag}[\\s>]([\\s\\S]*?)<\\/${tag}>`, "i"));
  return m ? m[1] : "";
}

// Get text content including CDATA
function getCdata(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, "i");
  const m  = xml.match(re);
  return m ? m[1].trim() : null;
}

function getText(xml, tag) {
  const re = new RegExp(`<${tag}[^>]*>([^<]*)<\\/${tag}>`, "i");
  const m  = xml.match(re);
  return m ? m[1].trim() : null;
}

function getAttr(xml, tag, attr) {
  const re = new RegExp(`<${tag}[^>]*\\s${attr}=["']([^"']+)["']`, "i");
  const m  = xml.match(re);
  return m ? m[1] : null;
}

function stripHtml(str) {
  return str
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g,   "&")
    .replace(/&lt;/g,    "<")
    .replace(/&gt;/g,    ">")
    .replace(/&quot;/g,  '"')
    .replace(/&#039;/g,  "'")
    .replace(/&#39;/g,   "'")
    .replace(/&apos;/g,  "'")
    .replace(/&nbsp;/g,  " ")
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/&#\\d+;/g,  " ")
    .replace(/&[a-z]+;/g," ")
    .replace(/\\s+/g,     " ")
    .trim();
}

function cleanText(str) {
  return stripHtml(str).replace(/\\s+/g, " ").trim();
}
