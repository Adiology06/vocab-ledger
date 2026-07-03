export default function SavedList({ words, onOpen, onDelete }) {
  if (!words.length) {
    return (
      <div className="empty-note">
        Nothing saved yet — search a word above and it will land here
        automatically.
      </div>
    );
  }

  const handleDelete = (e, id, word) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${word}"? This can't be undone.`)) {
      onDelete(id);
    }
  };

  return (
    <div className="saved-list">
      {words.map((w) => (
        <div className="saved-row" key={w.id} onClick={() => onOpen(w.word)}>
          <div>
            <span className="w">{w.word}</span>
            <span className="hi">{w.hindi_meaning}</span>
          </div>
          <div className="saved-row-right">
            <span className={`badge ${w.status}`}>{w.status}</span>
            <button
              className="delete-btn"
              title="Delete word"
              onClick={(e) => handleDelete(e, w.id, w.word)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
