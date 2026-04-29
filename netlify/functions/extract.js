// netlify/functions/extract.js
// ─────────────────────────────────────────────────────────────────────────────
// Serverless article extractor — runs on Netlify's servers (not the browser),
// so there's no CORS, no X-Frame-Options blocking, no rate limits.
//
// Endpoint: /.netlify/functions/extract?url=ARTICLE_URL
// Returns:  { title, text, author, date, image, siteName, url }
// ─────────────────────────────────────────────────────────────────────────────

export async function handler(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  const articleUrl = event.queryStringParameters?.url;

  if (!articleUrl) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: "Missing url parameter" }),
    };
  }

  try {
    // Fetch the article HTML from the origin server
    const response = await fetch(articleUrl, {
      headers: {
        // Mimic a real browser so sites don't block us
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();

    // ── Extract metadata from <meta> tags ──────────────────────────────────
    const getMeta = (name) => {
      const patterns = [
        new RegExp(`<meta[^>]+property=["']og:${name}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:${name}["']`, "i"),
        new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, "i"),
        new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, "i"),
      ];
      for (const p of patterns) {
        const m = html.match(p);
        if (m?.[1]) return decode(m[1]);
      }
      return null;
    };

    // ── Extract <title> ────────────────────────────────────────────────────
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const rawTitle = getMeta("title") || (titleMatch ? decode(titleMatch[1]) : null) || "";

    // ── Extract author ─────────────────────────────────────────────────────
    const author =
      getMeta("author") ||
      extractByPattern(html, [
        /<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i,
        /class=["'][^"']*author[^"']*["'][^>]*>([^<]{3,60})</i,
        /"author":\\s*\\{[^}]*"name":\\s*"([^"]+)"/i,
        /"author":\\s*"([^"]+)"/i,
      ]);

    // ── Extract published date ─────────────────────────────────────────────
    const date =
      getMeta("article:published_time") ||
      getMeta("published_time") ||
      extractByPattern(html, [
        /<time[^>]+datetime=["']([^"']+)["']/i,
        /"datePublished":\\s*"([^"]+)"/i,
        /"publishedAt":\\s*"([^"]+)"/i,
      ]);

    // ── Extract top image ──────────────────────────────────────────────────
    const image = getMeta("image") || getMeta("image:url") || null;

    // ── Extract site name ──────────────────────────────────────────────────
    const siteName =
      getMeta("site_name") ||
      new URL(articleUrl).hostname.replace(/^www\\./, "");

    // ── Extract main article text ──────────────────────────────────────────
    const text = extractText(html);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        title:    rawTitle,
        text:     text,
        author:   author,
        date:     date,
        image:    image,
        siteName: siteName,
        url:      articleUrl,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message || "Extraction failed" }),
    };
  }
}

// ─── TEXT EXTRACTION ──────────────────────────────────────────────────────────
function extractText(html) {
  // 1. Remove everything we don't want
  let clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<header[\s\S]*?<\/header>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "")
    .replace(/<aside[\s\S]*?<\/aside>/gi, "")
    .replace(/<figure[\s\S]*?<\/figure>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<!--[\\s\\S]*?-->/g, "");

  // 2. Try to find the article body by common containers
  const articlePatterns = [
    /<article[^>]*>([\s\S]*?)<\/article>/i,
    /<div[^>]*class=["'][^"']*(?:article-body|article__body|post-content|entry-content|story-body|article-content|main-content|content-body)[^"']*["'][^>]*>([\s\S]*?)<\/div>/i,
    /<main[^>]*>([\s\S]*?)<\/main>/i,
  ];

  let body = "";
  for (const pattern of articlePatterns) {
    const match = clean.match(pattern);
    if (match?.[1] && match[1].length > 500) {
      body = match[1];
      break;
    }
  }

  // 3. Fall back to full cleaned HTML if no article found
  if (!body) body = clean;

  // 4. Convert <p>, <h2>, <h3>, <li> tags to text with newlines
  const text = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<[^>]+>/g, "")   // strip remaining tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\\n{3,}/g, "\\n\\n") // collapse excess newlines
    .trim();

  // 5. Split into paragraphs, filter noise, return meaningful content
  const paragraphs = text
    .split("\\n\\n")
    .map(p => p.trim())
    .filter(p => p.length > 60); // skip short nav fragments

  return paragraphs.join("\\n\\n");
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function extractByPattern(html, patterns) {
  for (const p of patterns) {
    const m = html.match(p);
    if (m?.[1]?.[0] !== undefined) return decode(m[1].trim());
  }
  return null;
}

function decode(str) {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .trim();
}
