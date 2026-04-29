import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  T, RSS_SOURCES, YOUTUBE_SOURCES, CATEGORY_FILTERS, TRUSTED_SOURCES,
  MEDIA_SECTIONS, RADIO_STATIONS, PODCAST_FEEDS, VIBE_SECTIONS,
  CATEGORIES, BIAS, BIAS_STYLE, COUNTRY_KEYWORDS, WX
} from "./constants";

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const RSS_PROXY = "/.netlify/functions/rss?url=";
const CONTACT_EMAIL = "pedro.esteves.pt@proton.me";

function getBias(source) {
  if (!source) return null;
  if (BIAS[source]) return BIAS[source];
  const key = Object.keys(BIAS).find(k => source.toLowerCase().includes(k.toLowerCase()) || k.toLowerCase().includes(source.toLowerCase()));
  return key ? BIAS[key] : null;
}

function detectCountryFlag(title, source) {
  const text = (title + " " + (source||"")).toLowerCase();
  for (const { flag, words } of COUNTRY_KEYWORDS) {
    if (words.some(w => text.includes(w))) return flag;
  }
  return null;
}

function passesFilter(article, category) {
  const filter = CATEGORY_FILTERS[category];
  if (!filter) return true;

  const sourceLower = (article.source || "").toLowerCase();
  const trusted = TRUSTED_SOURCES[category] || [];
  if (trusted.some(t => sourceLower.includes(t))) return true;

  const text = ((article.title || "") + " " + (article.description || "") + " " + sourceLower).toLowerCase();
  return filter.require.some(kw => text.includes(kw));
}

async function fetchFeed(url, delayMs = 0) {
  try {
    if (delayMs) await new Promise(r => setTimeout(r, delayMs));
    const res = await fetch(`${RSS_PROXY}${encodeURIComponent(url)}&count=10`);
    if (!res.ok) return [];
    const data = await res.json();
    if (data.status !== "ok") return [];
    const feedTitle = data.feed?.title || new URL(url).hostname.replace("www.", "");
    return (data.feed?.items || []).map(item => ({
      id:          item.guid || item.link || item.title,
      title:       stripHtml(item.title || ""),
      description: stripHtml(item.description || ""),
      url:         item.link || "",
      image:       item.image || extractImage(item.description) || null,
      source:      feedTitle,
      publishedAt: item.pubDate ? new Date(item.pubDate) : new Date(),
      type:        "article",
    }));
  } catch { return []; }
}

async function fetchYouTubeFeed(channelId) {
  try {
    const res = await fetch(`/.netlify/functions/youtube?channelId=${channelId}&count=6`);
    if (!res.ok) return [];
    const data = await res.json();
    return (data.items || []).map(item => ({
      id:          `yt-${item.videoId}`,
      title:       item.title || "",
      description: item.description || "",
      url:         item.url || `https://www.youtube.com/watch?v=${item.videoId}`,
      image:       item.thumbnail || `https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`,
      source:      item.channelName || "YouTube",
      publishedAt: item.publishedAt ? new Date(item.publishedAt) : new Date(),
      type:        "video",
      videoId:     item.videoId,
    }));
  } catch { return []; }
}

const stripHtml = h => {
  if (!h) return "";
  return h
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#8211;/g, "—")
    .replace(/&#8212;/g, "—")
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8230;/g, "…")
    .replace(/&#\d+;/g, " ")
    .replace(/&[a-z]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 400);
};

function extractImage(html) {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

function timeAgo(date: any) {
  const d = (Date.now() - new Date(date).getTime()) / 1000;
  if (d < 60)    return "just now";
  if (d < 3600)  return `${Math.floor(d/60)}m ago`;
  if (d < 86400) return `${Math.floor(d/3600)}h ago`;
  return `${Math.floor(d/86400)}d ago`;
}

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(a => {
    const k = a.title.slice(0,60).toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
}

function loadBookmarks() { try { return JSON.parse(localStorage.getItem("thenewsBookmarks") || "[]"); } catch { return []; } }
function saveBookmarks(bm) { try { localStorage.setItem("thenewsBookmarks", JSON.stringify(bm)); } catch {} }

// ─── COMPONENTS ─────────────────────────────────────────────────────────────

function SkeletonCard({ featured, th }: any) {
  return (
    <div style={{ background:th.bgCard, border:`1px solid ${th.border}`, padding:featured?"1.5rem":"1.25rem", display:"flex", flexDirection:"column", gap:"0.75rem", borderRadius:8 }}>
      <div style={{ height:12, width:"35%", background:th.bgSkeleton1 }} />
      <div style={{ height:featured?24:16, background:th.bgSkeleton1 }} />
      <div style={{ height:featured?24:16, width:"75%", background:th.bgSkeleton1 }} />
      {featured && <div style={{ height:180, background:th.bgSkeleton1 }} />}
      <div style={{ height:12, background:th.bgSkeleton1 }} />
      <div style={{ height:12, width:"55%", background:th.bgSkeleton1 }} />
    </div>
  );
}

function CountryFlag({ title, source }: any) {
  const flag = detectCountryFlag(title, source);
  if (!flag) return null;
  return <span style={{ fontSize:"0.8rem", lineHeight:1, flexShrink:0 }}>{flag}</span>;
}

function BiasDot({ source }: any) {
  const bias = getBias(source);
  if (!bias) return null;
  const style = BIAS_STYLE[bias.rating];
  if (!style) return null;
  return (
    <div style={{ width:7, height:7, borderRadius:"50%", background:style.color, border:`1.5px solid ${style.color}`, opacity:0.85, flexShrink:0 }} title={style.label} />
  );
}

function NewsCard({ article, featured, onRead, th, bookmarks, onBookmark }: any) {
  const [hovered, setHovered] = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const isBookmarked = bookmarks.some((b: any) => b.id === article.id);

  return (
    <article
      onClick={() => onRead('in-app')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? th.bgCardHover : th.bgCard,
        border: `1px solid ${th.border}`,
        padding: "1.25rem",
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.2s",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gridColumn: featured ? "1 / -1" : "auto",
      }}
      className="group"
    >
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"1rem" }}>
        <span style={{ fontSize:"0.625rem", fontFamily:"monospace", color:th.textSource, textTransform:"uppercase", letterSpacing:"0.05em" }}>
          {article.source} • {timeAgo(article.publishedAt)}
        </span>
        <span style={{ opacity: hovered ? 1 : 0, transition:"opacity 0.2s", color:th.textMuted }}>↗</span>
      </div>

      {featured && article.image && !imgErr && (
        <div style={{ marginBottom:"1.5rem", overflow:"hidden", borderRadius:4 }}>
          <img src={article.image} alt="" loading="lazy" onError={()=>setImgErr(true)} style={{ width:"100%", height:"300px", objectFit:"cover", filter:th.bg==="#080809"?"grayscale(20%)":"", display:"block" }} />
        </div>
      )}

      <h2 style={{ fontFamily:"system-ui, sans-serif", fontSize:featured?"1.75rem":"1.125rem", fontWeight:900, color:th.textHead, lineHeight:1.2, margin:0, letterSpacing:"-0.02em", marginBottom:"1rem" }}>
        {article.title}
      </h2>
      
      {article.description && (
        <p style={{ color:th.textBody, fontSize:"0.875rem", lineHeight:1.5, margin:0, display:"-webkit-box", WebkitLineClamp:featured?3:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:"1.5rem" }}>
          {article.description}
        </p>
      )}

      <div style={{ display:"flex", alignItems:"center", gap:"0.75rem", marginTop:"auto" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onRead('in-app')} style={{ background:th.bgInput, border:`1px solid ${th.border}`, color:th.textHead, fontSize:"0.625rem", padding:"0.4rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold" }}>Read In-App</button>
        <button onClick={() => onRead('browser')} style={{ background:th.bgInput, border:`1px solid ${th.border}`, color:th.textHead, fontSize:"0.625rem", padding:"0.4rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold" }}>Browser ↗</button>
        <div style={{ height:1, flex:1, background:th.border }}></div>
        <button onClick={(e)=>{e.stopPropagation();onBookmark(article);}} style={{ background:"transparent", border:"none", color:isBookmarked?th.accent:th.textMuted, cursor:"pointer", fontSize:"0.625rem", fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>
          {isBookmarked?"Saved":"Save"}
        </button>
      </div>
    </article>
  );
}

function VideoCard({ video, onPlay, th }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onClick={() => onPlay('choose')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? th.bgCardHover : th.bgCard,
        border: `1px solid ${th.border}`,
        borderRadius: 8,
        cursor: "pointer",
        transition: "background 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-2px)" : "none",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <div style={{ position:"relative", paddingTop:"56.25%", background:th.bgSkeleton1 }}>
        <img src={video.image} alt={video.title} style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", objectFit:"cover" }} />
        <div style={{ position:"absolute", bottom:"0.5rem", right:"0.5rem", background:"rgba(0,0,0,0.8)", padding:"0.25rem 0.5rem", borderRadius:4, fontSize:"0.625rem", color:"white", fontFamily:"monospace", fontWeight:"bold", display:"flex", alignItems:"center", gap:"0.25rem" }}>
          <span style={{ width:6, height:6, background:"red", borderRadius:"50%" }}></span> LIVE
        </div>
      </div>
      <div style={{ padding:"1.25rem", display:"flex", flexDirection:"column", flex:1 }}>
         <span style={{ fontSize:"0.625rem", fontFamily:"monospace", color:th.textSource, textTransform:"uppercase", marginBottom:"0.5rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
          📺 {video.source}
        </span>
        <h3 style={{ fontSize:"1rem", fontWeight:700, color:th.textHead, lineHeight:1.3, margin:"0 0 0.5rem 0", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{video.title}</h3>
        <p style={{ fontSize:"0.75rem", color:th.textBody, margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{video.description}</p>
        <div style={{ marginTop:"auto", paddingTop:"1rem", display:"flex", justifyContent:"space-between", alignItems:"center" }} onClick={e => e.stopPropagation()}>
           <span style={{ fontSize:"0.625rem", color:th.textMuted }}>{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </article>
  );
}

function PodcastCard({ podcast, onPlay, th }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onClick={() => onPlay('in-app')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? th.bgCardHover : th.bgCard,
        border: `1px solid ${th.border}`,
        borderRadius: 8,
        padding: "1.25rem",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        gap: "1.25rem",
        height: "100%",
        alignItems: "center"
      }}
    >
      <div style={{ width: 80, height: 80, borderRadius: 8, overflow: "hidden", flexShrink:0, background:th.bgSkeleton1 }}>
        {podcast.image && <img src={podcast.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />}
      </div>
      <div style={{ display:"flex", flexDirection:"column", flex:1, overflow:"hidden" }}>
        <span style={{ fontSize:"0.625rem", fontFamily:"monospace", color:th.textSource, textTransform:"uppercase", marginBottom:"0.5rem", letterSpacing:"0.05em" }}>
          {podcast.podcast || "Podcast"}
        </span>
        <h3 style={{ fontSize:"1rem", fontWeight:700, color:th.textHead, lineHeight:1.3, margin:"0 0 0.5rem 0", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {podcast.title}
        </h3>
        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginTop:"auto" }} onClick={e => e.stopPropagation()}>
           <button onClick={() => onPlay('in-app')} style={{ background:th.bgInput, border:`1px solid ${th.border}`, color:th.textHead, fontSize:"0.625rem", padding:"0.3rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold", fontFamily:"monospace" }}>IN-APP ▶</button>
           <button onClick={() => onPlay('browser')} style={{ background:th.bgInput, border:`1px solid ${th.border}`, color:th.textHead, fontSize:"0.625rem", padding:"0.3rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold", fontFamily:"monospace" }}>web ↗</button>
           
           <span style={{ fontSize:"0.625rem", fontFamily:"monospace", color:th.textMuted, marginLeft: "auto" }}>
             {podcast.duration} &nbsp; {timeAgo(podcast.publishedAt)}
           </span>
        </div>
      </div>
    </article>
  );
}

function RadioCard({ radio, onPlay, th }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <article
      onClick={() => onPlay('in-app')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? th.bgCardHover : th.bgCard,
        border: `1px solid ${th.border}`,
        borderRadius: 8,
        padding: "1.5rem",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "100%",
      }}
    >
      <div style={{ display:"flex", alignItems:"center", gap:"1rem" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: th.bgSkeleton2, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.25rem", border:`1px solid ${th.borderSub}` }}>
          📻
        </div>
        <div>
          <div style={{ fontSize:"0.625rem", fontFamily:"monospace", color:th.textMuted, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.25rem", display:"flex", alignItems:"center", gap:"0.5rem" }}>
            {radio.country} {radio.genre}
          </div>
          <h3 style={{ fontSize:"1.125rem", fontWeight:800, color:th.textHead, margin:0, letterSpacing:"-0.02em" }}>{radio.name}</h3>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.5rem" }} onClick={e => e.stopPropagation()}>
        <button onClick={() => onPlay('in-app')} style={{ background:th.accentBg, border:`1px solid ${th.accent}`, color:th.accent, fontSize:"0.625rem", padding:"0.3rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold", fontFamily:"monospace" }}>PLAY</button>
        <button onClick={() => onPlay('browser')} style={{ background:th.bgInput, border:`1px solid ${th.border}`, color:th.textHead, fontSize:"0.625rem", padding:"0.3rem 0.6rem", borderRadius:4, cursor:"pointer", textTransform:"uppercase", fontWeight:"bold", fontFamily:"monospace" }}>EXT ↗</button>
      </div>
    </article>
  );
}


function ArticleReader({ article, th }: any) {
  const [content, setContent] = useState<any>({ type: "loading" });

  useEffect(() => {
    let active = true;
    setContent({ type: "loading" });
    fetch(`/.netlify/functions/extract?url=${encodeURIComponent(article.url)}`)
      .then(r => r.json())
      .then(data => {
        if (!active) return;
        if (data.status === "ok") setContent({ type: "success", text: data.content });
        else setContent({ type: "error", message: data.error || "Failed to extract." });
      })
      .catch(e => {
        if (active) setContent({ type: "error", message: e.message });
      });
    return () => { active = false; };
  }, [article.url]);

  return (
    <div style={{ padding: "3rem 2rem", maxWidth: 740, margin: "0 auto", fontSize: "1.0625rem", lineHeight: 1.8, color: th.textBody }}>
       {article.image && <img src={article.image} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: "2rem", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />}
       
       <h1 style={{ fontFamily: "system-ui, sans-serif", fontSize: "2.5rem", fontWeight: 900, color: th.textHead, marginBottom: "1rem", lineHeight: 1.1, letterSpacing: "-0.02em" }}>{article.title}</h1>
       
       <div style={{ fontSize: "0.875rem", color: th.textSource, marginBottom: "2.5rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: `1px solid ${th.border}`, paddingBottom: "1rem" }}>
         {article.source} <span style={{color: th.textMuted}}>• {new Date(article.publishedAt).toLocaleString()}</span>
       </div>
       
       {content.type === "loading" && (
           <div style={{ textAlign: "center", padding: "4rem", color: th.textMuted }}>
               <div style={{ display: "inline-block", width: 24, height: 24, border: `2px solid ${th.border}`, borderTopColor: th.accent, borderRadius: "50%", animation: "spin 1s linear infinite" }} />
               <div style={{ marginTop: "1rem", fontSize: "0.875rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.1em" }}>Extracting article...</div>
               <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
           </div>
       )}
       
       {content.type === "error" && (
         <div style={{ padding: "2rem", background: th.bgSkeleton1, borderRadius: 8, border: `1px solid ${th.border}`, textAlign: "center" }}>
           <h3 style={{ color: th.textHead, marginTop: 0 }}>Extraction Unsuccessful</h3>
           <p style={{ color: th.textMuted, fontSize: "0.875rem" }}>The article structure could not be parsed automatically.</p>
           
           <div style={{ marginTop: "2rem", textAlign: "left" }}>
             <h4 style={{ color: th.textHead, fontSize: "0.875rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>Brief Summary:</h4>
             <p style={{ fontStyle: "italic", color: th.textBody }}>{article.description}</p>
           </div>
           
           <button onClick={() => window.open(article.url, "_blank")} style={{ padding: "0.75rem 1.5rem", background: th.accentBg, color: th.accent, border: `1px solid ${th.accentBord||th.accent}`, borderRadius: 8, cursor: "pointer", marginTop: "2rem", fontSize: "0.875rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
             Read Original Article ↗
           </button>
         </div>
       )}
       
       {content.type === "success" && (
         <div style={{ whiteSpace: "pre-wrap", overflowWrap: "break-word" }}>
             {content.text}
             <div style={{ marginTop: "4rem", borderTop: `1px solid ${th.border}`, paddingTop: "2rem", textAlign: "center" }}>
                 <button onClick={() => window.open(article.url, "_blank")} style={{ padding: "0.75rem 1.5rem", background: "transparent", color: th.textMuted, border: `1px solid ${th.border}`, borderRadius: 8, cursor: "pointer", fontSize: "0.875rem", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                   View Original Source ↗
                 </button>
             </div>
         </div>
       )}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function NewsApp() {
  const [night, setNight] = useState(true);
  const [activeCategory, setActiveCategory] = useState("top");
  const [subTab, setSubTab] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [readerItem, setReaderItem] = useState<any>(null);
  const [choiceItem, setChoiceItem] = useState<any>(null);
  
  const [articles, setArticles] = useState([]);
  const [videos, setVideos] = useState([]);
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [bookmarks, setBookmarks] = useState(loadBookmarks);

  const th = night ? T.night : T.day;

  // Sync subTabs
  useEffect(() => {
    if (activeCategory === "live" && !MEDIA_SECTIONS.some(s=>s.id===subTab)) setSubTab("video");
    else if (activeCategory === "vibe" && !VIBE_SECTIONS.some(s=>s.id===subTab)) setSubTab("goodnews");
  }, [activeCategory, subTab]);

  const loadData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      if (activeCategory === "live") {
        if (subTab === "video" || !subTab) {
          const res = await Promise.allSettled(YOUTUBE_SOURCES.live.map((id:string) => fetchYouTubeFeed(id)));
          let fetchedVideos = res.flatMap((r:any) => r.status === "fulfilled" ? r.value : []);
          if (fetchedVideos.length === 0) {
            fetchedVideos = [
              { id: "yt-9Auq9mYxFEE", title: "Sky News Live", description: "Watch Sky News live", url: "https://www.youtube.com/watch?v=9Auq9mYxFEE", image: "https://img.youtube.com/vi/9Auq9mYxFEE/hqdefault.jpg", source: "Sky News", publishedAt: new Date(), type: "video", videoId: "9Auq9mYxFEE" },
              { id: "yt-bbyp5qXEL0c", title: "Al Jazeera English Live", description: "Stay updated with the latest news from Al Jazeera.", url: "https://www.youtube.com/watch?v=bbyp5qXEL0c", image: "https://img.youtube.com/vi/bbyp5qXEL0c/hqdefault.jpg", source: "Al Jazeera", publishedAt: new Date(), type: "video", videoId: "bbyp5qXEL0c" },
              { id: "yt-0bE1bI8tO3A", title: "DW News Live", description: "News from Germany and the world.", url: "https://www.youtube.com/watch?v=0bE1bI8tO3A", image: "https://img.youtube.com/vi/0bE1bI8tO3A/hqdefault.jpg", source: "DW News", publishedAt: new Date(), type: "video", videoId: "0bE1bI8tO3A" }
            ];
          }
          setVideos(fetchedVideos as never[]);
        } else if (subTab === "podcasts") {
          const res = await Promise.allSettled(PODCAST_FEEDS.map(url => fetch(`/.netlify/functions/podcast?url=${encodeURIComponent(url)}`).then(r=>r.json())));
          setPodcasts(res.flatMap(r => r.status === "fulfilled" && !r.value.error ? [r.value] : []));
        }
      } else {
        const feedKey = activeCategory === "vibe" ? (subTab || "goodnews") : activeCategory;
        const res = await Promise.allSettled((RSS_SOURCES[feedKey]||[]).map(url => fetchFeed(url)));
        let all = res.flatMap(r => r.status === "fulfilled" ? r.value : []);
        let filtered = all.filter(a => passesFilter(a, feedKey));
        if (filtered.length < 3) filtered = all;
        setArticles(dedupe(filtered).sort((a,b)=>new Date(b.publishedAt).getTime()-new Date(a.publishedAt).getTime()));
      }
    } catch(e) { 
      setError(e.message); 
    } finally { 
      setLoading(false); 
    }
  }, [activeCategory, subTab]);

  useEffect(() => { loadData(); }, [loadData]);

  const toggleBookmark = (article: any) => {
    setBookmarks((prev: any) => {
      const exists = prev.some((b: any)=>b.id===article.id);
      const next   = exists ? prev.filter((b: any)=>b.id!==article.id) : [article,...prev];
      saveBookmarks(next);
      return next;
    });
  };

  const filteredArticles = articles.filter((a: any) => a.title.toLowerCase().includes(searchQuery.toLowerCase()) || (a.description||"").toLowerCase().includes(searchQuery.toLowerCase()));
  const featured = filteredArticles[0] || null;
  const mixed = filteredArticles.slice(1);
  
  const filteredVideos = videos.filter((v: any) => v.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPodcasts = podcasts.filter((p: any) => p.title.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredRadio = RADIO_STATIONS.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.genre.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div style={{ minHeight:"100vh", background:th.bg, color:th.text, transition:"background 0.3s, color 0.3s", width:"100%", fontFamily:"system-ui, sans-serif" }}>
      
      {/* HEADER */}
      <header style={{ padding:"1.25rem 2rem", display:"flex", justifyContent:"space-between", alignItems:"center", background:th.bgHeader, borderBottom:`1px solid ${th.border}` }}>
        <h1 style={{ fontFamily:"'Playfair Display', serif", fontWeight:900, fontSize:"1.5rem", color:th.textHead, margin:0, fontStyle:"italic", letterSpacing:"-0.03em" }}>
          TheNewsHub <span style={{ fontSize:"0.6rem", color:th.textMuted, letterSpacing:"0.15em", fontStyle:"normal", verticalAlign:"top", marginLeft:4 }}>LIVE</span>
        </h1>
        <div style={{ flex:1, display:"flex", justifyContent:"center", padding:"0 2rem" }}>
          <div style={{ width: "100%", maxWidth: 480, position: "relative" }}>
            <span style={{ position:"absolute", left:"1rem", top:"50%", transform:"translateY(-50%)", color:th.textMuted, fontSize:"0.875rem" }}>⌕</span>
            <input type="text" placeholder="Search..." value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} style={{ width:"100%", padding:"0.6rem 1rem 0.6rem 2.5rem", borderRadius:8, background:th.bgInput, border:`1px solid ${th.border}`, color:th.textBody, fontSize:"0.875rem", outline:"none" }} />
          </div>
        </div>
        <div style={{ display:"flex", gap:"1.5rem", alignItems:"center" }}>
          <div style={{ fontSize:"0.5625rem", letterSpacing:"0.15em", textTransform:"uppercase", color:th.textMuted, textAlign:"right", lineHeight:1.4 }}>
            UPDATED<br/>
            {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
          <button onClick={()=>setNight(!night)} style={{ display:"flex", alignItems:"center", gap:"0.5rem", background:th.bgInput, border:`1px solid ${th.accent}`, padding:"0.4rem 1rem", borderRadius:9999, color:th.accent, fontSize:"0.625rem", cursor:"pointer", textTransform:"uppercase", fontWeight:"bold", letterSpacing:"0.1em" }}>
            <span style={{ fontSize:"0.875rem" }}>{night?"🌕":"☀️"}</span>
            <span>{night?"NIGHT":"DAY"}</span>
          </button>
        </div>
      </header>

      {/* CATEGORIES NAV */}
      <div style={{ borderBottom:`1px solid ${th.border}`, padding:"0 2rem", overflowX:"auto", scrollbarWidth:"none", display:"flex", justifyContent:"center" }}>
        <div style={{ display:"flex", gap:"2rem" }}>
          {CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={()=>{setActiveCategory(cat.id); setSubTab(null);}} 
                style={{ 
                  background:"transparent", border:"none", 
                  color: isActive ? th.textHead : th.textMuted, 
                  borderBottom: isActive ? `2px solid ${th.accent}` : "2px solid transparent", 
                  cursor:"pointer", textTransform:"uppercase", fontSize:"0.75rem", 
                  fontWeight: isActive ? 800 : 600, padding:"1rem 0", display:"flex", 
                  alignItems:"center", gap:"0.5rem", whiteSpace:"nowrap", letterSpacing:"0.05em",
                  transition: "color 0.2s"
                }}
              >
                <span style={{ fontSize:"1rem" }}>{cat.icon}</span>
                {cat.short} {isActive && cat.id==="vibe" && <span style={{fontSize:"0.6rem"}}>✨</span>}
                {isActive && cat.id==="live" && <span style={{width:6, height:6, background:"red", borderRadius:"50%"}}></span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* SUB-CATEGORIES NAV */}
      {(activeCategory === "live" || activeCategory === "vibe") && (
        <div style={{ display:"flex", justifyContent:"center", padding:"1.25rem 2rem", borderBottom:`1px solid ${th.border}` }}>
          <div style={{ display:"flex", gap:"1rem" }}>
            {(activeCategory === "live" ? MEDIA_SECTIONS : VIBE_SECTIONS).map(sub => (
              <button 
                key={sub.id} 
                onClick={()=>setSubTab(sub.id)} 
                style={{ 
                  background: subTab===sub.id ? (activeCategory==="vibe"?"rgba(16,185,129,0.1)":"rgba(245,197,80,0.1)") : "transparent", 
                  border:`1px solid ${subTab===sub.id ? (activeCategory==="vibe"?"#10b981":th.accent) : th.border}`, 
                  borderRadius:9999, padding:"0.5rem 1.25rem", 
                  color: subTab===sub.id ? (activeCategory==="vibe"?"#10b981":th.accent) : th.textMuted, 
                  fontSize:"0.75rem", fontWeight:600, cursor:"pointer", transition:"all 0.2s" 
                }}
              >
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* SUB-HEADER LABEL (Vibe or Media) */}
      {(activeCategory === "vibe" || activeCategory === "live") && subTab && (
        <div style={{ padding:"1.5rem 2rem 0", display:"flex", alignItems:"center", gap:"1.5rem" }}>
          <h2 style={{ fontSize:"1.25rem", fontWeight:800, margin:0, display:"flex", alignItems:"center", gap:"0.5rem", color:th.textHead }}>
             {(activeCategory==="live"?MEDIA_SECTIONS:VIBE_SECTIONS).find(s=>s.id===subTab)?.label}
          </h2>
          <span style={{ fontSize:"0.625rem", padding:"0.25rem 0.5rem", border:`1px solid ${activeCategory==="vibe"?"rgba(16,185,129,0.3)":"rgba(220,38,38,0.3)"}`, borderRadius:4, color:activeCategory==="vibe"?"#10b981":"#dc2626", textTransform:"uppercase", letterSpacing:"0.1em", fontWeight:"bold", background:activeCategory==="vibe"?"rgba(16,185,129,0.1)":"rgba(220,38,38,0.1)" }}>
             {activeCategory==="vibe" ? "Good Vibes" : (subTab==="radio" ? "• ON AIR" : (subTab==="video"?"• LIVE":"🎙 AUDIO"))}
          </span>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto", width: "100%" }}>
        {loading ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(320px, 1fr))", gap:"2rem" }}>
            <SkeletonCard th={th}/>
            <SkeletonCard th={th}/>
            <SkeletonCard th={th}/>
          </div>
        ) : error ? (
          <div style={{ padding:"4rem", textAlign:"center", color:th.textMuted }}>
            <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>⚠️</div>
            <p>Error loading content: {error}</p>
          </div>
        ) : (
          <div style={{ 
            display:"grid", 
            gridTemplateColumns: activeCategory==="live" && subTab==="radio" ? "repeat(auto-fill, minmax(300px, 1fr))" 
              : activeCategory==="live" && subTab==="podcasts" ? "repeat(auto-fill, minmax(400px, 1fr))"
              : "repeat(auto-fill, minmax(360px, 1fr))", 
            gap:"2rem" 
          }}>
            {activeCategory === "live" ? (
               subTab === "video" ? filteredVideos.map((v,i) => <VideoCard key={i} video={v} onPlay={(mode:string) => mode==="choose" ? setChoiceItem({type:"video", item:v}) : mode==="browser" ? window.open(v.url) : setReaderItem({type:"video", item:v})} th={th} />) :
               subTab === "podcasts" ? filteredPodcasts.map((p,i) => <PodcastCard key={i} podcast={p} onPlay={(mode:string) => mode==="browser" ? window.open(p.mp3) : setReaderItem({type:"audio", item:p})} th={th} />) :
               filteredRadio.map((r,i) => <RadioCard key={i} radio={r} onPlay={(mode:string) => mode==="browser" ? window.open(r.url) : setReaderItem({type:"audio", item:r})} th={th} />)
            ) : (
               <>
                 {featured && <NewsCard article={featured} featured onRead={(mode:string) => mode==="browser" ? window.open(featured.url) : setReaderItem({type:"article", item:featured})} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} />}
                 {mixed.map((a: any,i: number) => <NewsCard key={a.id||i} article={a} onRead={(mode:string) => mode==="browser" ? window.open(a.url) : setReaderItem({type:"article", item:a})} th={th} bookmarks={bookmarks} onBookmark={toggleBookmark} />)}
               </>
            )}
          </div>
        )}
      </main>

      {/* MODAL / READER */}
      {choiceItem && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 10000, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }} 
          onClick={() => setChoiceItem(null)}
        >
          <div 
            style={{ background: th.bgCard, width: "100%", maxWidth: 400, borderRadius: 12, padding: "2rem", border: `1px solid ${th.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", textAlign: "center" }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ fontSize: "1.25rem", color: th.textHead, marginBottom: "1rem", marginTop: 0 }}>Play Video</h3>
            <p style={{ color: th.textBody, marginBottom: "2rem", fontSize: "0.875rem" }}>Would you like to watch this video here or open YouTube in a new tab?</p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
              <button 
                onClick={() => { setReaderItem(choiceItem); setChoiceItem(null); }}
                style={{ background: th.accentBg, color: th.accent, border: `1px solid ${th.accent}`, padding: "0.75rem 1.5rem", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
              >
                Play In-App
              </button>
              <button 
                onClick={() => { window.open(choiceItem.item.url, "_blank"); setChoiceItem(null); }}
                style={{ background: th.bgInput, color: th.textHead, border: `1px solid ${th.border}`, padding: "0.75rem 1.5rem", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}
              >
                Browser ↗
              </button>
            </div>
          </div>
        </div>
      )}

      {readerItem && (
        <div 
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }} 
          onClick={() => setReaderItem(null)}
        >
          <div 
            style={{ background: th.bg, width: "100%", maxWidth: readerItem.type === 'video' ? 1000 : 800, height: "90vh", borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", position: "relative", border: `1px solid ${th.border}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} 
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: "1rem 1.5rem", borderBottom: `1px solid ${th.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: th.bgHeader }}>
              <h3 style={{ margin: 0, fontSize: "1.125rem", color: th.textHead, fontWeight: "bold", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: "1rem" }}>
                 {readerItem.item.title || readerItem.item.name}
              </h3>
              <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                <button onClick={() => {
                  const url = readerItem.item.url || readerItem.item.mp3;
                  if (url) window.open(url, "_blank");
                }} style={{ background: th.bgInput, border: `1px solid ${th.border}`, color: th.textHead, cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", padding: "0.4rem 0.75rem", borderRadius: 6, fontWeight: "bold" }}>
                  <span>↗</span> OPEN IN BROWSER
                </button>
                <button onClick={() => setReaderItem(null)} style={{ background: "transparent", border: "none", color: th.textMuted, cursor: "pointer", fontSize: "1.75rem", lineHeight: 1, padding: "0 0.25rem" }}>&times;</button>
              </div>
            </div>
            <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
              {readerItem.type === 'video' && (
                <iframe src={`https://www.youtube.com/embed/${readerItem.item.videoId || readerItem.item.id.replace(/^yt-/, '').replace(/^yt:video:/, '')}?autoplay=1`} style={{ width: "100%", height: "100%", border: "none" }} allow="autoplay; encrypted-media; fullscreen" allowFullScreen />
              )}
              {readerItem.type === 'audio' && (
                <div style={{ padding: "4rem 2rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "3rem" }}>
                   <div style={{ width: 240, height: 240, borderRadius: "50%", background: th.bgSkeleton2, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "6rem", overflow: "hidden", border: `1px solid ${th.border}`, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                       {readerItem.item.image ? <img src={readerItem.item.image} style={{width:"100%", height:"100%", objectFit:"cover"}} /> : "📻"}
                   </div>
                   <div style={{ textAlign: "center" }}>
                       <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: th.textHead, marginBottom: "0.5rem" }}>{readerItem.item.title || readerItem.item.name}</div>
                       <div style={{ fontSize: "1rem", color: th.textMuted }}>{readerItem.item.source || readerItem.item.genre || readerItem.item.podcast}</div>
                   </div>
                   <audio src={readerItem.item.url || readerItem.item.mp3} controls autoPlay style={{ width: "100%", maxWidth: 600 }} />
                </div>
              )}
              {readerItem.type === 'article' && (
                <ArticleReader article={readerItem.item} th={th} />
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
