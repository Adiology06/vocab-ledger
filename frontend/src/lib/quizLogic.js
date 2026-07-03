function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5) }
function sample(arr, n, exclude = []) { return shuffle(arr.filter(x => !exclude.includes(x))).slice(0, n) }

export function generateQuestion(word, pool) {
  const otherWords = pool.filter(w => w.word !== word.word)
  const hasSyn = word.synonyms?.length > 0
  const hasAnt = word.antonyms?.length > 0

  const availableTypes = ["meaning"]
  if (hasSyn && otherWords.length >= 3) availableTypes.push("synonym")
  if (hasAnt && otherWords.length >= 3) availableTypes.push("antonym")
  const type = availableTypes[Math.floor(Math.random() * availableTypes.length)]

  if (type === "synonym" || type === "antonym") {
    const correctList = type === "synonym" ? word.synonyms : word.antonyms
    const correct = correctList[Math.floor(Math.random() * correctList.length)]

    // build distractors WITH their origin so we can explain them for free
    const oppositeList = (type === "synonym" ? word.antonyms : word.synonyms) || []
    const taggedOpposite = oppositeList.map(w => ({
      text: w, detail: type === "synonym"
        ? `Opposite of "${word.word}", not similar to it`
        : `Similar to "${word.word}", not opposite of it`
    }))
    const taggedFromOthers = otherWords.flatMap(ow => {
      const list = type === "synonym" ? (ow.synonyms || []) : (ow.antonyms || [])
      return list.map(w => ({
        text: w, detail: `Actually a ${type} of "${ow.word}", not "${word.word}"`
      }))
    })
    const distractPool = [...taggedOpposite, ...taggedFromOthers].filter(o => o.text !== correct)
    const distractors = shuffle(distractPool).slice(0, 3)

    const options = shuffle([
      { text: correct, detail: `Correct — a ${type} of "${word.word}"` },
      ...distractors
    ])

    return {
      type, word, correctAnswer: correct,
      prompt: type === "synonym"
        ? `Which word is closest in meaning to "${word.word}"?`
        : `Which word is most OPPOSITE in meaning to "${word.word}"?`,
      options: options.map(o => ({ text: o.text, isCorrect: o.text === correct, detail: o.detail }))
    }
  }

  const correct = word.hindi_meaning || word.definition
  const wrongEntries = sample(otherWords.filter(w => w.hindi_meaning || w.definition), 3)
  const options = shuffle([
    { text: correct, isCorrect: true, detail: `Correct meaning of "${word.word}"` },
    ...wrongEntries.map(w => ({
      text: w.hindi_meaning || w.definition, isCorrect: false, detail: `This is the meaning of "${w.word}", not "${word.word}"`
    }))
  ])

  return { type: "meaning", word, correctAnswer: correct, prompt: `What does "${word.word}" mean?`, options }
}