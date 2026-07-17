let currentIcon = null;
let currentCard = null;
let currentSelection = "";
let lastRect = null;

const PREFIXES = [
  "un",
  "re",
  "dis",
  "mis",
  "pre",
  "non",
  "over",
  "under",
  "sub",
  "inter",
  "trans",
  "super",
  "semi",
  "anti",
  "de",
  "en",
  "em",
  "fore",
  "in",
  "im",
  "ir",
  "il",
  "co",
  "counter",
  "extra",
  "hyper",
  "post",
  "pro",
];
const SUFFIXES = [
  "tion",
  "sion",
  "ment",
  "ness",
  "ity",
  "ty",
  "al",
  "ial",
  "ing",
  "ly",
  "ful",
  "less",
  "able",
  "ible",
  "ous",
  "ious",
  "ive",
  "ize",
  "ise",
  "er",
  "or",
  "ist",
  "ship",
  "hood",
  "dom",
  "ance",
  "ence",
  "ward",
  "wise",
];
const PREFIX_MEANINGS = {
  un: "not / opposite of",
  re: "again / back",
  dis: "not / apart",
  mis: "wrongly / badly",
  pre: "before",
  non: "not",
  over: "too much / above",
  under: "too little / below",
  sub: "under / lesser",
  inter: "between / among",
  trans: "across / beyond",
  super: "above / beyond",
  semi: "half / partly",
  anti: "against",
  de: "remove / reverse",
  en: "to cause to be",
  em: "to cause to be",
  fore: "before / in front",
  in: "not / into",
  im: "not / into",
  ir: "not",
  il: "not",
  co: "together",
  counter: "against",
  extra: "beyond",
  hyper: "excessive",
  post: "after",
  pro: "forward / in favor of",
};
const SUFFIX_MEANINGS = {
  tion: "act/state/result of (noun)",
  sion: "act/state/result of (noun)",
  ment: "result or state of an action (noun)",
  ness: "state or quality of (noun)",
  ity: "state or quality of (noun)",
  ty: "state or quality of (noun)",
  al: "relating to (adjective)",
  ial: "relating to (adjective)",
  ing: "action or process (verb form)",
  ly: "in a manner of (adverb)",
  ful: "full of",
  less: "without",
  able: "capable of being",
  ible: "capable of being",
  ous: "full of / characterized by",
  ious: "full of / characterized by",
  ive: "tending to / having the nature of",
  ize: "to make / become",
  ise: "to make / become",
  er: "one who does (agent noun)",
  or: "one who does (agent noun)",
  ist: "one who practices/believes in",
  ship: "state, quality, or position",
  hood: "state or condition of",
  dom: "state, condition, or domain of",
  ance: "state, quality, or action",
  ence: "state, quality, or action",
  ward: "in the direction of",
  wise: "in the manner of",
};

async function getSession() {
  try {
    if (!chrome?.storage?.local) return null;
    return await new Promise((resolve) => {
      chrome.storage.local.get(["wordjar_session"], (result) => {
        const s = result?.wordjar_session;
        if (s && s.expires_at && s.expires_at * 1000 > Date.now()) resolve(s);
        else resolve(null);
      });
    });
  } catch {
    return null;
  }
}

async function saveWordToWordJar(session, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/words`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      user_id: session.user_id,
      word: data.word,
      hindi_meaning: data.hindi_meaning,
      definition: data.definition,
      pos: data.pos,
      prefix: data.prefix,
      suffix: data.suffix,
      ipa: data.ipa,
      hindi_pron: data.hindi_pron,
      synonyms: data.synonyms,
      antonyms: data.antonyms,
      example: data.example,
      source: "extension",
      status: "new",
    }),
  });
  return res.ok;
}

function detectAffixes(word) {
  const w = word.toLowerCase();
  let prefix = null,
    suffix = null;
  for (const p of [...PREFIXES].sort((a, b) => b.length - a.length))
    if (w.startsWith(p) && w.length > p.length + 3) {
      prefix = p;
      break;
    }
  for (const s of [...SUFFIXES].sort((a, b) => b.length - a.length))
    if (w.endsWith(s) && w.length > s.length + 3) {
      suffix = s;
      break;
    }
  return { prefix, suffix };
}

function ipaToDevanagari(ipa) {
  if (!ipa) return "";
  let s = ipa.replace(/[/[\]ˈˌ.]/g, "");
  const map = [
    ["tʃ", "च"],
    ["dʒ", "ज"],
    ["aɪ", "आइ"],
    ["aʊ", "आउ"],
    ["ɔɪ", "ऑइ"],
    ["eɪ", "ए"],
    ["oʊ", "ओ"],
    ["əʊ", "ओ"],
    ["iː", "ई"],
    ["uː", "ऊ"],
    ["ɑː", "आ"],
    ["ɔː", "ऑ"],
    ["ɜː", "अ"],
    ["θ", "थ"],
    ["ð", "द"],
    ["ʃ", "श"],
    ["ʒ", "ज़"],
    ["ŋ", "ङ"],
    ["ə", "अ"],
    ["ɪ", "इ"],
    ["i", "ई"],
    ["e", "ए"],
    ["ɛ", "ए"],
    ["æ", "ऐ"],
    ["ʌ", "अ"],
    ["ɑ", "आ"],
    ["ɒ", "ऑ"],
    ["ɔ", "ऑ"],
    ["ʊ", "उ"],
    ["u", "ऊ"],
    ["p", "प"],
    ["b", "ब"],
    ["t", "ट"],
    ["d", "ड"],
    ["k", "क"],
    ["g", "ग"],
    ["f", "फ"],
    ["v", "व"],
    ["s", "स"],
    ["z", "ज़"],
    ["h", "ह"],
    ["m", "म"],
    ["n", "न"],
    ["l", "ल"],
    ["r", "र"],
    ["j", "य"],
    ["w", "व"],
  ];
  let out = "",
    i = 0;
  while (i < s.length) {
    let matched = false;
    for (const [k, v] of map)
      if (s.startsWith(k, i)) {
        out += v;
        i += k.length;
        matched = true;
        break;
      }
    if (!matched) i++;
  }
  return out;
}

function looksLikeSentence(t) {
  return t.trim().split(/\s+/).length > 4;
}

async function fetchHindiMeaning(word) {
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|hi`,
    );
    const json = await res.json();
    const candidates = [
      {
        text: json?.responseData?.translatedText,
        score: parseFloat(json?.responseData?.match) || 0,
      },
      ...(json?.matches || []).map((m) => ({
        text: m.translation,
        score: parseFloat(m.match) || 0,
      })),
    ].filter((c) => c.text && !looksLikeSentence(c.text));
    if (!candidates.length) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0].score >= 0.6 ? candidates[0].text : null;
  } catch {
    return null;
  }
}

async function fetchDatamuse(word, rel) {
  try {
    const res = await fetch(
      `https://api.datamuse.com/words?${rel}=${encodeURIComponent(word)}&max=8`,
    );
    return (await res.json()).map((x) => x.word);
  } catch {
    return [];
  }
}

async function lookupWord(rawWord) {
  const word = rawWord.trim().toLowerCase();
  const [dictJson, hindi, dmSyn, dmAnt] = await Promise.all([
    fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`,
    )
      .then((r) => (r.ok ? r.json() : null))
      .catch(() => null),
    fetchHindiMeaning(word),
    fetchDatamuse(word, "rel_syn"),
    fetchDatamuse(word, "rel_ant"),
  ]);

  const dictEntry = dictJson ? dictJson[0] : null;
  if (!dictEntry && !hindi) return { notFound: true, word };

  const allDefs = [];
  dictEntry?.meanings?.forEach((m) =>
    m.definitions?.forEach((d) => allDefs.push({ ...d, pos: m.partOfSpeech })),
  );
  const chosen = allDefs[0] || null;

  const synonyms = (chosen?.synonyms?.length ? chosen.synonyms : dmSyn).slice(
    0,
    6,
  );
  const antonyms = (chosen?.antonyms?.length ? chosen.antonyms : dmAnt).slice(
    0,
    6,
  );
  const phoneticObj = dictEntry?.phonetics?.find((p) => p.text);
  const ipa = phoneticObj?.text || "";
  const { prefix, suffix } = detectAffixes(word);

  return {
    word,
    pos: chosen?.pos || "",
    definition: chosen?.definition || "",
    example: chosen?.example || "",
    hindi_meaning: hindi || "",
    ipa,
    hindi_pron: ipa ? ipaToDevanagari(ipa) : "",
    prefix,
    prefixMeaning: prefix ? PREFIX_MEANINGS[prefix] : null,
    suffix,
    suffixMeaning: suffix ? SUFFIX_MEANINGS[suffix] : null,
    synonyms,
    antonyms,
  };
}

function removeCard() {
  if (currentCard) {
    currentCard.remove();
    currentCard = null;
  }
}
function removeIcon() {
  if (currentIcon) {
    currentIcon.remove();
    currentIcon = null;
  }
}

function renderCard(data, x, y) {
  removeCard();
  const card = document.createElement("div");
  card.className = "wordjar-card";
  card.style.left = `${x}px`;
  card.style.top = `${y}px`;

  if (data.notFound) {
    card.innerHTML = `<div class="wj-header"><b>${data.word}</b><span class="wj-close">✕</span></div><div class="wj-empty">No meaning found for this word.</div>`;
  } else {
    card.innerHTML = `
      <div class="wj-header"><b>${data.word}</b>${data.pos ? `<span class="wj-pos">${data.pos}</span>` : ""}<span class="wj-close">✕</span></div>
      ${data.hindi_pron ? `<div class="wj-pron">उच्चारण: ${data.hindi_pron}</div>` : ""}
      <div class="wj-row"><div class="wj-label">हिन्दी अर्थ</div><div class="wj-hindi">${data.hindi_meaning || "—"}</div></div>
      <div class="wj-row"><div class="wj-label">Meaning</div><div>${data.definition || "—"}</div></div>
      ${data.prefix || data.suffix ? `<div class="wj-affix">${data.prefix ? `Prefix "${data.prefix}" — ${data.prefixMeaning || "?"} ` : ""}${data.suffix ? `Suffix "${data.suffix}" — ${data.suffixMeaning || "?"}` : ""}</div>` : ""}
      ${data.synonyms.length ? `<div class="wj-row"><div class="wj-label">Synonyms</div><div>${data.synonyms.join(", ")}</div></div>` : ""}
      ${data.antonyms.length ? `<div class="wj-row"><div class="wj-label">Antonyms</div><div>${data.antonyms.join(", ")}</div></div>` : ""}
      <div class="wj-save-area"></div>
      <a class="wj-open" href="https://self-vocab.vercel.app/?word=${encodeURIComponent(data.word)}" target="_blank">Open full details in WordJar →</a>    `;
  }

  document.body.appendChild(card);
  currentCard = card;
  card.querySelector(".wj-close").addEventListener("click", removeCard);
}

async function doLookup(word, x, y) {
  removeIcon();
  const loadingCard = document.createElement("div");
  loadingCard.className = "wordjar-card";
  loadingCard.style.left = `${x}px`;
  loadingCard.style.top = `${y}px`;
  loadingCard.innerHTML = `<div class="wj-loading">Looking up "${word}"…</div>`;
  document.body.appendChild(loadingCard);
  currentCard = loadingCard;

  const data = await lookupWord(word);
  renderCard(data, x, y);
  if (!data.notFound) attachSaveArea(data);
}

async function attachSaveArea(data) {
  const area = currentCard?.querySelector(".wj-save-area");
  if (!area) return;

  let session = null;
  try {
    session = await getSession();
  } catch {
    session = null;
  }

  if (!session) {
    area.innerHTML = `<a class="wj-signin" href="https://self-vocab.vercel.app/" target="_blank">Sign up / Log in to save →</a>`;
    return;
  }

  const btn = document.createElement("button");
  btn.className = "wj-save-btn";
  btn.textContent = "+ Save to my words";
  btn.addEventListener("click", async () => {
    btn.textContent = "Saving…";
    btn.disabled = true;
    try {
      const ok = await saveWordToWordJar(session, data);
      btn.textContent = ok ? "✓ Saved" : "Couldn't save — try again";
    } catch {
      btn.textContent = "Couldn't save — try again";
    }
  });
  area.appendChild(btn);
}

document.addEventListener("mouseup", (e) => {
  const selection = window.getSelection().toString().trim();
  if (e.target.closest(".wordjar-icon") || e.target.closest(".wordjar-card"))
    return;
  removeIcon();

  if (
    !selection ||
    selection.split(/\s+/).length > 3 ||
    selection.length > 40
  ) {
    currentSelection = "";
    return;
  }
  currentSelection = selection;
  const range = window.getSelection().getRangeAt(0);
  lastRect = range.getBoundingClientRect();

  const icon = document.createElement("div");
  icon.className = "wordjar-icon";
  icon.textContent = "📖";
  icon.style.left = `${lastRect.right + window.scrollX + 6}px`;
  icon.style.top = `${lastRect.top + window.scrollY - 4}px`;
  icon.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    doLookup(
      currentSelection,
      lastRect.left + window.scrollX,
      lastRect.bottom + window.scrollY + 8,
    );
  });
  document.body.appendChild(icon);
  currentIcon = icon;
});

document.addEventListener("mousedown", (e) => {
  if (
    !e.target.closest(".wordjar-icon") &&
    !e.target.closest(".wordjar-card")
  ) {
    removeIcon();
    removeCard();
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "CONTEXT_LOOKUP") {
    const rect = lastRect || { left: 100, bottom: 100 };
    doLookup(
      message.word,
      rect.left + window.scrollX,
      rect.bottom + window.scrollY + 8,
    );
  }
});
