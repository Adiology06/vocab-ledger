import { getCachedWord, setCachedWord } from "./wordCacheService"
const DICT_API = "https://api.dictionaryapi.dev/api/v2/entries/en/"
const DATAMUSE_API = "https://api.datamuse.com/words?"
const TRANSLATE_API = "https://api.mymemory.translated.net/get?"

const PREFIXES = ["un","re","dis","mis","pre","non","over","under","sub","inter","trans","super","semi","anti","de","en","em","fore","in","im","ir","il","co","counter","extra","hyper","post","pro"]
const SUFFIXES = ["tion","sion","ment","ness","ity","ty","al","ial","ing","ly","ful","less","able","ible","ous","ious","ive","ize","ise","er","or","ist","ship","hood","dom","ance","ence","ward","wise"]

const PREFIX_MEANINGS = {
  // Existing
  un: "not / opposite of", re: "again / back", dis: "not / apart",
  mis: "wrongly / badly", pre: "before", non: "not",
  over: "too much / above", under: "too little / below", sub: "under / lesser",
  inter: "between / among", trans: "across / beyond", super: "above / beyond",
  semi: "half / partly", anti: "against", de: "remove / reverse",
  en: "to cause to be", em: "to cause to be", fore: "before / in front",
  in: "not / into", im: "not / into", ir: "not", il: "not",
  co: "together", counter: "against", extra: "beyond", hyper: "excessive",
  post: "after", pro: "forward / in favor of",
  
  // High-Yield Exam Additions
  a: "without / not", an: "without / not", ab: "away from",
  ad: "to / toward", ambi: "both / around", auto: "self",
  bene: "good / well", mal: "bad / evil", bi: "two",
  circum: "around", com: "with / together", con: "with / together",
  contra: "against", dia: "through / across", dys: "bad / difficult",
  epi: "upon / over", ex: "out / former", hetero: "different",
  homo: "same", hypo: "under / below", macro: "large",
  micro: "small", mega: "great / million", multi: "many",
  neo: "new", omni: "all", poly: "many",
  peri: "around", retro: "backward", sym: "together / with",
  syn: "together / with", tele: "distant", tri: "three",
  uni: "one", mono: "one", pseudo: "false"
};

const SUFFIX_MEANINGS = {
  // Existing
  tion: "act/state/result of (noun)", sion: "act/state/result of (noun)",
  ment: "result or state of an action (noun)", ness: "state or quality of (noun)",
  ity: "state or quality of (noun)", ty: "state or quality of (noun)",
  al: "relating to (adjective)", ial: "relating to (adjective)",
  ing: "action or process (verb form)", ly: "in a manner of (adverb)",
  ful: "full of", less: "without", able: "capable of being",
  ible: "capable of being", ous: "full of / characterized by",
  ious: "full of / characterized by", ive: "tending to / having the nature of",
  ize: "to make / become", ise: "to make / become",
  er: "one who does (agent noun)", or: "one who does (agent noun)",
  ist: "one who practices/believes in", ship: "state, quality, or position",
  hood: "state or condition of", dom: "state, condition, or domain of",
  ance: "state, quality, or action", ence: "state, quality, or action",
  ward: "in the direction of", wise: "in the manner of",

  // High-Yield Exam Additions
  ate: "to make / become (verb) or characterized by (adj)", 
  en: "to make / made of", ify: "to make / cause to be", 
  fy: "to make / cause to be", ic: "relating to / characterized by",
  ical: "relating to", ish: "having the quality of / like",
  ism: "belief / practice / state of", logy: "study of",
  ology: "study of", ary: "relating to / place where",
  ery: "action / place / collection", ant: "one who / tending to",
  ent: "one who / tending to", cide: "kill / act of killing",
  cracy: "rule / government", crat: "ruler / member of rule",
  phile: "lover of", phobe: "fear of", phobia: "extreme fear of",
  tude: "state or condition of", ure: "act / process / result"
};

export function detectAffixes(word) {
  const w = word.toLowerCase()
  let prefix = null, suffix = null
  for (const p of [...PREFIXES].sort((a, b) => b.length - a.length)) {
    if (w.startsWith(p) && w.length > p.length + 3) { prefix = p; break }
  }
  for (const s of [...SUFFIXES].sort((a, b) => b.length - a.length)) {
    if (w.endsWith(s) && w.length > s.length + 3) { suffix = s; break }
  }
  return { prefix, suffix }
}

export function getAffixInfo(word) {
  const { prefix, suffix } = detectAffixes(word)
  let root = word.toLowerCase()
  if (suffix) root = root.slice(0, -suffix.length)
  if (prefix) root = root.slice(prefix.length)
  return {
    prefix, prefixMeaning: prefix ? PREFIX_MEANINGS[prefix] : null,
    suffix, suffixMeaning: suffix ? SUFFIX_MEANINGS[suffix] : null,
    approxRoot: (prefix || suffix) ? root : null
  }
}

export function ipaToDevanagari(ipa) {
  if (!ipa) return ""
  let s = ipa.replace(/[/[\]ˈˌ.]/g, "")
  const map = [
    ["tʃ","च"],["dʒ","ज"],["aɪ","आइ"],["aʊ","आउ"],["ɔɪ","ऑइ"],["eɪ","ए"],["oʊ","ओ"],["əʊ","ओ"],
    ["iː","ई"],["uː","ऊ"],["ɑː","आ"],["ɔː","ऑ"],["ɜː","अ"],
    ["θ","थ"],["ð","द"],["ʃ","श"],["ʒ","ज़"],["ŋ","ङ"],
    ["ə","अ"],["ɪ","इ"],["i","ई"],["e","ए"],["ɛ","ए"],["æ","ऐ"],["ʌ","अ"],
    ["ɑ","आ"],["ɒ","ऑ"],["ɔ","ऑ"],["ʊ","उ"],["u","ऊ"],
    ["p","प"],["b","ब"],["t","ट"],["d","ड"],["k","क"],["g","ग"],
    ["f","फ"],["v","व"],["s","स"],["z","ज़"],["h","ह"],["m","म"],
    ["n","न"],["l","ल"],["r","र"],["j","य"],["w","व"]
  ]
  let out = "", i = 0
  while (i < s.length) {
    let matched = false
    for (const [k, v] of map) {
      if (s.startsWith(k, i)) { out += v; i += k.length; matched = true; break }
    }
    if (!matched) i++
  }
  return out
}

function looksLikeSentence(text) {
  const wordCount = text.trim().split(/\s+/).length
  return wordCount > 4
}

async function fetchHindiMeaning(word) {
  try {
    const res = await fetch(`${TRANSLATE_API}q=${encodeURIComponent(word)}&langpair=en|hi`)
    const json = await res.json()
    const candidates = [
      { text: json?.responseData?.translatedText, score: parseFloat(json?.responseData?.match) || 0 },
      ...(json?.matches || []).map(m => ({ text: m.translation, score: parseFloat(m.match) || 0 }))
    ].filter(c => c.text && !looksLikeSentence(c.text))
    if (!candidates.length) return null
    candidates.sort((a, b) => b.score - a.score)
    return candidates[0].score >= 0.6 ? candidates[0].text : null
  } catch { return null }
}

async function fetchDatamuse(word, rel) {
  try {
    const res = await fetch(`${DATAMUSE_API}${rel}=${encodeURIComponent(word)}&max=8`)
    const json = await res.json()
    return json.map(x => x.word)
  } catch { return [] }
}

export async function lookupWord(rawWord, level = 'Beginner') {
  const word = rawWord.trim().toLowerCase()
  if (!word) return null

  const cached = await getCachedWord(word)
  if (cached) return { ...cached, fromCache: true }

  const [dictJson, hindi, dmSyn, dmAnt, dmSuggest] = await Promise.all([
    fetch(DICT_API + encodeURIComponent(word)).then(r => r.ok ? r.json() : null).catch(() => null),
    fetchHindiMeaning(word),
    fetchDatamuse(word, "rel_syn"),
    fetchDatamuse(word, "rel_ant"),
    fetchDatamuse(word, "ml")
  ])

  const dictEntry = dictJson ? dictJson[0] : null
  if (!dictEntry && !hindi) return { notFound: true, word }

  const allDefs = []
  dictEntry?.meanings?.forEach(m => {
    m.definitions?.forEach(d => allDefs.push({ ...d, pos: m.partOfSpeech }))
  })

  let chosen = allDefs[0] || null
  if (allDefs.length > 1) {
    const byLength = [...allDefs].sort((a, b) => a.definition.length - b.definition.length)
    if (level === 'Beginner') chosen = byLength[0]
    else if (level === 'Advanced') chosen = byLength[byLength.length - 1]
    else chosen = byLength[Math.floor(byLength.length / 2)]
  }

  const synonyms = (chosen?.synonyms?.length ? chosen.synonyms : dmSyn).slice(0, 8)
  const antonyms = (chosen?.antonyms?.length ? chosen.antonyms : dmAnt).slice(0, 8)
  const example = chosen?.example || allDefs.find(d => d.example)?.example || ""

  const phoneticObj = dictEntry?.phonetics?.find(p => p.text)
  const ipa = phoneticObj?.text || ""
  const { prefix, prefixMeaning, suffix, suffixMeaning, approxRoot } = getAffixInfo(word)

  const result = {
    word,
    pos: chosen?.pos || "",
    definition: chosen?.definition || "",
    example,
    hindi_meaning: hindi || "",
    ipa,
    hindi_pron: ipa ? ipaToDevanagari(ipa) : "",
    prefix, prefixMeaning, suffix, suffixMeaning, approxRoot,
    synonyms,
    antonyms,
    suggestions: dmSuggest.slice(0, 8)
  }
  setCachedWord(word, result) // fire-and-forget, don't block the response
  return result

}