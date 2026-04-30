export const T = {
  night: {
    bg: "#080809", 
    bgHeader: "#080809", 
    bgCard: "transparent",
    bgCardHover: "rgba(255,255,255,0.02)", 
    bgReader: "#080809", 
    bgInput: "rgba(255,255,255,0.05)",
    bgSkeleton1: "rgba(255,255,255,0.03)", 
    bgSkeleton2: "rgba(255,255,255,0.05)",
    border: "rgba(255,255,255,0.1)", 
    borderHover: "rgba(255,255,255,0.1)",
    borderSub: "rgba(255,255,255,0.1)", 
    borderTab: "rgba(255,255,255,0.1)",
    text: "#D1D1D1", 
    textHead: "#ffffff", 
    textBody: "#D1D1D1", 
    textMuted: "rgba(255,255,255,0.4)",
    textFaint: "rgba(255,255,255,0.3)", 
    textSource: "#D1D1D1", 
    accent: "#326891",
    accentBg: "transparent", 
    accentBord: "#326891",
    live: "#C00000",
    shadow: "none", 
    scrollThumb: "rgba(255,255,255,0.1)", 
    footer: "rgba(255,255,255,0.3)",
  },
  day: {
    bg: "#FCFCFC", 
    bgHeader: "#FCFCFC", 
    bgCard: "transparent",
    bgCardHover: "rgba(0,0,0,0.02)", 
    bgReader: "#FCFCFC", 
    bgInput: "rgba(0,0,0,0.05)",
    bgSkeleton1: "rgba(0,0,0,0.03)", 
    bgSkeleton2: "rgba(0,0,0,0.05)",
    border: "rgba(0,0,0,0.1)", 
    borderHover: "rgba(0,0,0,0.1)",
    borderSub: "rgba(0,0,0,0.1)", 
    borderTab: "rgba(0,0,0,0.1)",
    text: "#1A1A1A", 
    textHead: "#1A1A1A", 
    textBody: "#1A1A1A", 
    textMuted: "rgba(0,0,0,0.5)",
    textFaint: "rgba(0,0,0,0.3)", 
    textSource: "#1A1A1A", 
    accent: "#326891",
    accentBg: "transparent", 
    accentBord: "#326891",
    live: "#C00000",
    shadow: "none", 
    scrollThumb: "rgba(0,0,0,0.1)", 
    footer: "rgba(0,0,0,0.4)",
  },
};

export const RSS_SOURCES = {
  top:      ["https://feeds.bbci.co.uk/news/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml","https://www.theguardian.com/world/rss"],
  uk:       ["https://feeds.bbci.co.uk/news/uk/rss.xml","https://www.theguardian.com/uk/rss"],
  world:    ["https://feeds.bbci.co.uk/news/world/rss.xml","https://www.aljazeera.com/xml/rss/all.xml","https://www.theguardian.com/world/rss"],
  europe:   ["https://feeds.bbci.co.uk/news/world/europe/rss.xml","https://rss.dw.com/xml/rss-en-eu","https://feeds.thelocal.com/rss/es","https://feeds.thelocal.com/rss/fr","https://feeds.thelocal.com/rss/it","https://feeds.bbci.co.uk/news/uk/rss.xml","https://www.theguardian.com/uk/rss"],
  americas: ["https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/US.xml","https://feeds.bbci.co.uk/news/world/latin_america/rss.xml"],
  asia:     ["https://feeds.bbci.co.uk/news/world/asia/rss.xml","https://www.scmp.com/rss/91/feed","https://thediplomat.com/feed","https://feeds.bbci.co.uk/news/world/asia/china/rss.xml","https://feeds.bbci.co.uk/news/world/asia/india/rss.xml"],
  mideast:  ["https://feeds.bbci.co.uk/news/world/middle_east/rss.xml","https://www.aljazeera.com/xml/rss/all.xml","https://rss.dw.com/xml/rss-en-me"],
  tech:     ["https://techcrunch.com/feed/","https://www.wired.com/feed/rss","https://feeds.arstechnica.com/arstechnica/index","https://www.theverge.com/rss/tech/index.xml","https://www.engadget.com/rss.xml"],
  business: ["https://feeds.bbci.co.uk/news/business/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Business.xml","https://www.theguardian.com/business/rss"],
  science:  ["https://feeds.bbci.co.uk/news/science_and_environment/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Science.xml","https://feeds.feedburner.com/sciencealert-latestnews"],
  sports:   ["https://feeds.bbci.co.uk/sport/rss.xml","https://www.theguardian.com/sport/rss","https://feeds.bbci.co.uk/sport/football/rss.xml"],
  football: ["https://feeds.bbci.co.uk/sport/football/rss.xml","https://www.theguardian.com/football/rss","https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml","https://feeds.bbci.co.uk/sport/football/european/rss.xml"],
  nfl:      ["https://www.espn.com/espn/rss/nfl/news","https://www.cbssports.com/rss/headlines/nfl/","https://bleacherreport.com/nfl.rss","https://feeds.bbci.co.uk/sport/american-football/rss.xml"],
  basketball: ["https://www.espn.com/espn/rss/nba/news","https://www.cbssports.com/rss/headlines/nba/","https://bleacherreport.com/nba.rss","https://feeds.bbci.co.uk/sport/basketball/rss.xml"],
  climbing: ["https://www.climbing.com/feed/","https://www.ukclimbing.com/rss/news.xml","https://www.planetmountain.com/en/rss/news.xml"],
  cars:     ["https://www.motor1.com/rss/news/all/","https://www.autocar.co.uk/rss","https://electrek.co/feed/","https://www.topgear.com/car-news/rss"],
  motos:    ["https://www.motorcycledaily.com/feed","https://www.rideapart.com/rss/articles/all","https://www.webbikeworld.com/feed"],
  stocks:   ["https://feeds.bbci.co.uk/news/business/rss.xml","https://rss.nytimes.com/services/xml/rss/nyt/Business.xml","https://www.theguardian.com/business/rss"],
  crypto:   ["https://cointelegraph.com/rss","https://crypto.news/feed","https://news.bitcoin.com/feed"],
  goodnews: ["https://www.goodnewsnetwork.org/feed/","https://www.positive.news/feed/","https://www.sunnyskyz.com/feed/"],
  funny:    ["https://www.boredpanda.com/feed/","https://feeds.feedburner.com/TheOnion","https://www.oddee.com/feed/"],
  weird:    ["https://www.odditycentral.com/feed","https://www.atlasobscura.com/feeds/latest","https://www.mentalfloss.com/rss"],
};

export const CATEGORY_FILTERS = {
  cars: { require: ["car","cars","auto","automotive","vehicle","vehicles","suv","sedan","coupe","ev","electric vehicle","tesla","bmw","ford","toyota","formula 1","f1"] },
  tech: { require: ["tech","technology","ai","artificial intelligence","software","hardware","app","apps","startup","device","apple","google","microsoft","cybersecurity"] },
  motos: { require: ["motorcycle","motorcycles","moto","motorbike","bike","biker","riding","harley","kawasaki","yamaha","motogp"] },
  sports: { require: ["sport","sports","football","soccer","basketball","tennis","golf","rugby","cricket","baseball","hockey","athletics","olympic","f1"] },
  football: { require: ["football","soccer","premier league","champions league","la liga","serie a","ligue 1","world cup","goal","match","transfer"] },
  nfl: { require: ["nfl","american football","quarterback","touchdown","superbowl","super bowl","patriots","cowboys","chiefs","49ers","eagles"] },
  basketball: { require: ["nba","basketball","lakers","warriors","celtics","bulls","heat","lebron","curry","jokic","playoffs","dunk"] },
  climbing: { require: ["climbing","rock climbing","climber","bouldering","lead climbing","free solo","yosemite","el capitan"] },
  crypto: { require: ["bitcoin","btc","ethereum","eth","crypto","cryptocurrency","blockchain","defi","nft","web3","binance","coinbase"] },
  business: { require: ["business","company","companies","corporate","startup","market","markets","economy","finance","bank","stock","shares"] },
  stocks: { require: ["stock","stocks","share","shares","market","nasdaq","dow jones","s&p 500","invest","trading","etf","ipo","dividend"] },
  science: { require: ["science","scientific","scientist","research","discovery","experiment","biology","space","physics","climate"] },
  goodnews: { require: ["rescue","saved","hero","heroic","breakthrough","discovery","achieve","success","celebrate","hope","inspire","kindness"] },
  funny: { require: ["funny","hilarious","comedy","laugh","lol","viral","weird","bizarre","mistake","fail"] },
  weird: { require: ["weird","strange","bizarre","unusual","mysterious","mystery","unexplained","quirky","rare","discovery"] },
};

const YT = id => id;

export const YOUTUBE_SOURCES = {
  live:     [YT("UCnUYZLuoy1rq1aVMwx4aTzw"),YT("UCNye-wNBqNL5ZzHSJj3l8Bg"),YT("UCknLrEdhRCp1aegoMqRaCZg"),YT("UCBi2mrWuNuyYy4gbM6vU7mQ")],
  top:      [YT("UCnUYZLuoy1rq1aVMwx4aTzw"),YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  world:    [YT("UCNye-wNBqNL5ZzHSJj3l8Bg"),YT("UCknLrEdhRCp1aegoMqRaCZg")],
  europe:   [YT("UCknLrEdhRCp1aegoMqRaCZg")],
  asia:     [YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  americas: [YT("UCnUYZLuoy1rq1aVMwx4aTzw")],
  mideast:  [YT("UCNye-wNBqNL5ZzHSJj3l8Bg")],
  tech:     [YT("UCBJycsmduvYEL83R_U4JriQ"),YT("UCXuqSBlHAE6Xw-yeJA0Tunw")],
  business: [YT("UCrGyqELkKkXKggRphOTv0Tg"),YT("UCvJJ_dzjViJCoLf5uKUTwoA")],
  science:  [YT("UCZYTClx2T1of7BRZ86-8fow"),YT("UC7DdEm33SyaTDtWYGO2CwdA")],
  sports:   [YT("UCqZQlzSHbVJrwrn5XvzrzcA"),YT("UC1QLLgrGrpTqpad0zJB4Tsg")],
  football: [YT("UCqZQlzSHbVJrwrn5XvzrzcA"), YT("UCnSj7U62wodgrNaKan6ee0A"), YT("UC1QLLgrGrpTqpad0zJB4Tsg")],
  nfl:      [YT("UCDVYQ4Zhbm3S2dlz7P1GBDg"), YT("UCY3NEq2LYrmdoGkevo9BH5A")],
  basketball: [YT("UChTEMZBCsTmYO3lM_EHSAEQ"), YT("UCEjOSbbaOfgnfRODEEMbb2g")],
  climbing: [YT("UCX9ok0rHnvnENLSK7jdnXxA"), YT("UCNs4zEpFBVCSIMWTGdDV8SA")],
  cars:     [YT("UCjOl2AUblVmg2rA_cRgZkFg"),YT("UCUhFaUpnq31m6TNX2VKVSVA")],
  motos:    [YT("UCB_cdRhIDhlavY2I5URSC7g"),YT("UCMkMkYwBjSxAaxEBdQBxl5Q")],
  stocks:   [YT("UCvJJ_dzjViJCoLf5uKUTwoA"),YT("UCrGyqELkKkXKggRphOTv0Tg")],
  crypto:   [YT("UCCatR7nWbYrkVXdxXb4cGXw"),YT("UCYP7pHJAN4pOHb62F2p3eRQ")],
  goodnews: [YT("UCY1kMZp36IQSyNx_9h4mpCg"), YT("UCPIycc6GXKVBECHOSFBSg")],
  funny:    [YT("UCPDis9pjXuqyI7RYLJ-TTSA"), YT("UCdC0An4ZPNr_YiFiYoVbwaw")],
};

export const TRUSTED_SOURCES = {
  nfl:        ["nfl","nfl films","nfl network","nfl on espn","nfl highlights","nfl throwback"],
  basketball: ["nba","house of highlights","basketball","nba highlights"],
  football:   ["premier league","champions league","uefa","sky sports football","la liga","goal"],
  climbing:   ["magnus","ondra","bouldering","climbing","ifsc","eddie fowke"],
};

export const MEDIA_SECTIONS = [
  { id:"video",    label:"📺 Live Video", short:"Video" },
  { id:"radio",    label:"📻 Live Radio", short:"Radio" },
  { id:"podcasts", label:"🎙 Podcasts",   short:"Pods"  },
];

export const RADIO_STATIONS = [
  { id:"bbc",      name:"BBC World Service",  country:"🇬🇧", genre:"Global News",   url:"https://stream.live.vc.bbcmedia.co.uk/bbc_world_service" },
  { id:"npr",      name:"NPR News",           country:"🇺🇸", genre:"US News",       url:"https://npr-ice.streamguys1.com/live.mp3" },
  { id:"rfi",      name:"RFI English",        country:"🇫🇷", genre:"World News",    url:"https://rfi-enlaces.akacast.akamaistream.net/7/422/470324/v1/gnmedia.akacast.akamaistream.net/rfi_anglais" },
  { id:"dw",       name:"DW Radio English",   country:"🇩🇪", genre:"World News",    url:"https://icecast.walmradio.com:8443/classic" },
  { id:"alj",      name:"Al Jazeera Radio",   country:"🇶🇦", genre:"World News",    url:"https://live-hls-web-aja.getaj.net/AJA/index.m3u8" },
];

export const PODCAST_FEEDS = [
  "https://feeds.npr.org/510318/podcast.xml",
  "https://podcasts.files.bbci.co.uk/p02nq0gn.rss",
  "https://feeds.npr.org/500005/podcast.xml",
  "https://feeds.feedburner.com/TEDTalks_audio",
  "https://feeds.feedburner.com/TheIndicatorFromPlanetMoney",
];

export const BUSINESS_SECTIONS = [
  { id:"business", label:"📊 Business", short:"News" },
  { id:"stocks",   label:"📈 Stocks",   short:"Stocks" },
  { id:"crypto",   label:"₿ Crypto",   short:"Crypto" },
];

export const SPORTS_SECTIONS = [
  { id:"sports",     label:"🏆 All Sports",  short:"All" },
  { id:"football",   label:"⚽ Football",    short:"Football" },
  { id:"nfl",        label:"🏈 NFL",         short:"NFL" },
  { id:"basketball", label:"🏀 Basketball",  short:"NBA" },
  { id:"climbing",   label:"🧗 Climbing",    short:"Climb" },
];

export const VIBE_SECTIONS = [
  { id:"goodnews", label:"😊 Good News", short:"Good" },
  { id:"funny",    label:"😂 Funny",     short:"Funny" },
  { id:"weird",    label:"🌀 Weird",     short:"Weird" },
];

export const WORLD_REGIONS = [
  { id:"world",    label:"🌐 All World",    short:"All" },
  { id:"europe",   label:"🇪🇺 Europe",      short:"EU" },
  { id:"asia",     label:"🌏 Asia",         short:"Asia" },
  { id:"americas", label:"🌎 Americas",     short:"Amer" },
  { id:"mideast",  label:"🕌 Middle East",  short:"ME" },
];

export const CATEGORIES = [
  { id:"top",      label:"Top",         short:"Top",   icon:"⚡" },
  { id:"world",    label:"World",       short:"World", icon:"🌍", hasDropdown:true },
  { id:"tech",     label:"Tech",        short:"Tech",  icon:"💻" },
  { id:"business", label:"Business",    short:"Biz",   icon:"📊" },
  { id:"science",  label:"Science",     short:"Sci",   icon:"🔬" },
  { id:"sports",   label:"Sports",      short:"Sport", icon:"🏆" },
  { id:"cars",     label:"Cars",        short:"Cars",  icon:"🚗" },
  { id:"motos",    label:"Motorcycles", short:"Motos", icon:"🏍" },
  { id:"vibe",     label:"Vibe",        short:"Vibe",  icon:"😊" },
  { id:"live",     label:"Media",       short:"Media", icon:"📡" },
  { id:"saved",    label:"Saved",       short:"Saved", icon:"🔖" },
];

export const BIAS = {
  "BBC News":{ rating:"C",label:"Centre" },"BBC News - Home":{ rating:"C",label:"Centre" },
  "BBC News - World":{ rating:"C",label:"Centre" },"BBC News - Europe":{ rating:"C",label:"Centre" },
  "BBC News - Science & Environment":{ rating:"C",label:"Centre" },"BBC News - Business":{ rating:"C",label:"Centre" },
  "BBC Sport - Sport":{ rating:"C",label:"Centre" },"Reuters":{ rating:"C",label:"Centre" },
  "NYT > HomePage":{ rating:"LC",label:"Lean Left" },
  "New York Times":{ rating:"LC",label:"Lean Left" },
  "Sky News":{ rating:"RC",label:"Lean Right" },"Al Jazeera English":{ rating:"LC",label:"Lean Left" },
  "TechCrunch":{ rating:"LC",label:"Lean Left" },"Wired":{ rating:"LC",label:"Lean Left" },
  "Ars Technica":{ rating:"C",label:"Centre" },"New Scientist":{ rating:"C",label:"Centre" },
  "Euronews":{ rating:"C",label:"Centre" },"DW":{ rating:"C",label:"Centre" },
  "NPR":{ rating:"LC",label:"Lean Left" },"The Guardian":{ rating:"LC",label:"Lean Left" },
};

export const BIAS_STYLE = {
  L: { color:"#3b82f6",bg:"rgba(59,130,246,0.12)",label:"Left" },
  LC:{ color:"#60a5fa",bg:"rgba(96,165,250,0.12)",label:"Lean Left" },
  C: { color:"#9ca3af",bg:"rgba(156,163,175,0.12)",label:"Centre" },
  RC:{ color:"#f87171",bg:"rgba(248,113,113,0.12)",label:"Lean Right" },
  R: { color:"#ef4444",bg:"rgba(239,68,68,0.12)",label:"Right" },
};

export const COUNTRY_KEYWORDS = [
  { flag:"🇺🇸", words:["us","usa","america","american","washington","trump","biden","congress"] },
  { flag:"🇬🇧", words:["uk","britain","british","england","english","london","scotland"] },
  { flag:"🇨🇳", words:["china","chinese","beijing","shanghai","xi jinping","ccp"] },
  { flag:"🇷🇺", words:["russia","russian","moscow","kremlin","putin","ukraine war"] },
  { flag:"🇩🇪", words:["germany","german","berlin","merkel","scholz"] },
  { flag:"🇫🇷", words:["france","french","paris","macron"] },
  { flag:"🇮🇳", words:["india","indian","modi","delhi","mumbai"] },
  { flag:"🇯🇵", words:["japan","japanese","tokyo","osaka","yen"] },
  { flag:"🇰🇷", words:["south korea","korean","seoul","samsung","k-pop"] },
  { flag:"🇧🇷", words:["brazil","brazilian","rio","lula","brasília"] },
  { flag:"🇪🇺", words:["european union","brussels","ecb"] },
];

export const WX = {
  0:{icon:"☀️"},1:{icon:"🌤"},2:{icon:"⛅"},3:{icon:"☁️"},45:{icon:"🌫"},48:{icon:"🌫"},
  51:{icon:"🌦"},53:{icon:"🌦"},55:{icon:"🌧"},61:{icon:"🌧"},63:{icon:"🌧"},65:{icon:"🌧"},
  71:{icon:"🌨"},73:{icon:"🌨"},75:{icon:"❄️"},80:{icon:"🌦"},81:{icon:"🌧"},82:{icon:"⛈"},
  95:{icon:"⛈"},96:{icon:"⛈"},99:{icon:"⛈"},
};
