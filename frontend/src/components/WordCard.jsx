export default function WordCard({
  data,
  onCopy,
  onMark,
  onSearchRelated,
  hideReview,
  onClose,
  onSave,
  isSaved,
}) {
  if (!data) return null;

  const handleCopy = () => {
    const text = `${data.word}${data.pos ? " (" + data.pos + ")" : ""}
Hindi meaning: ${data.hindi_meaning || "—"}
Pronunciation (Hindi script): ${data.hindi_pron || "—"}
English definition: ${data.definition || "—"}
Prefix: ${data.prefix || "none"} | Suffix: ${data.suffix || "none"}
Synonyms: ${(data.synonyms || []).join(", ") || "—"}
Antonyms: ${(data.antonyms || []).join(", ") || "—"}
Example: ${data.example || "—"}`;
    navigator.clipboard.writeText(text);
    onCopy?.();
  };

  return (
    <div className="card">
      <div className="card-top">
        <div>
          <span className="headword">{data.word}</span>
          {data.pos && <span className="pos-tag">{data.pos}</span>}
          <div className="pron-row">
            {data.ipa && <span className="pron-ipa">{data.ipa}</span>}
            {data.hindi_pron && (
              <span className="pron-hi">उच्चारण: {data.hindi_pron}</span>
            )}
          </div>
        </div>
        <button className="copy-btn" onClick={handleCopy}>
          ⧉ Copy card
        </button>
        {onClose && (
          <button className="copy-btn close-btn" onClick={onClose}>
            ✕ Close
          </button>
        )}
      </div>

      <div className="grid-2">
        <div>
          <div className="field-label">Hindi meaning · हिन्दी अर्थ</div>
          <div className="hindi-meaning">
            {data.hindi_meaning || "not found"}
          </div>
        </div>
        <div>
          <div className="field-label">English explanation</div>
          <div className="eng-def">{data.definition || "not found"}</div>
        </div>
      </div>

      {data.prefix || data.suffix ? (
        <div className="affix-block">
          {data.prefix && (
            <div className="affix-line">
              <b>Prefix "{data.prefix}"</b> —{" "}
              {data.prefixMeaning || "meaning not listed"}
            </div>
          )}
          {data.suffix && (
            <div className="affix-line">
              <b>Suffix "{data.suffix}"</b> —{" "}
              {data.suffixMeaning || "meaning not listed"}
            </div>
          )}
          {data.approxRoot && (
            <div className="affix-line root">
              Approx. root: <b>{data.approxRoot}</b>{" "}
              <span className="disclaimer">
                (pattern-based guess, not verified etymology)
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="affix-block">
          <span className="empty-note">
            No common prefix or suffix detected
          </span>
        </div>
      )}

      {data.example && (
        <>
          <div className="field-label">Example</div>
          <div className="example">"{data.example}"</div>
        </>
      )}

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div>
          <div className="field-label">Synonyms</div>
          <div className="chip-row">
            {data.synonyms?.length ? (
              data.synonyms.map((s) => (
                <span
                  key={s}
                  className="chip syn"
                  onClick={() => onSearchRelated(s)}
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="empty-note">none found</span>
            )}
          </div>
        </div>
        <div>
          <div className="field-label">Antonyms</div>
          <div className="chip-row">
            {data.antonyms?.length ? (
              data.antonyms.map((s) => (
                <span
                  key={s}
                  className="chip anto"
                  onClick={() => onSearchRelated(s)}
                >
                  {s}
                </span>
              ))
            ) : (
              <span className="empty-note">none found</span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <div className="field-label">Similar words to learn next</div>
        <div className="chip-row">
          {data.suggestions?.length ? (
            data.suggestions.map((s) => (
              <span
                key={s}
                className="chip suggest"
                onClick={() => onSearchRelated(s)}
              >
                {s}
              </span>
            ))
          ) : (
            <span className="empty-note">none found</span>
          )}
        </div>
      </div>

      {!hideReview && (
        <div className="review-row">
          <span className="prompt">&gt; did you already know this word?</span>
          <div className="stamp-btns">
            <button
              className="stamp remembered"
              onClick={() => onMark("remembered")}
            >
              Remembered
            </button>
            <button className="stamp forgot" onClick={() => onMark("forgot")}>
              Forgot
            </button>
          </div>
        </div>
      )}
      {hideReview && onSave && (
        <div className="review-row">
          <span className="prompt">&gt; want to keep this word?</span>
          {isSaved ? (
            <span className="saved-tag">✓ in your list</span>
          ) : (
            <button className="save-word-btn" onClick={onSave}>
              + Save to my words
            </button>
          )}
        </div>
      )}
      <div className="disclaimer">
        Hindi pronunciation is an approximate phonetic transliteration, not
        audio.
      </div>
    </div>
  );
}
