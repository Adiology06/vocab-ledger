export function exportWordsToCSV(words) {
  const headers = [
    "Word",
    "Hindi Meaning",
    "English Definition",
    "Prefix",
    "Suffix",
    "Synonyms",
    "Antonyms",
    "Example",
    "Status",
  ];

  const escapeCell = (val) => {
    const str = (val ?? "").toString().replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = words.map((w) =>
    [
      w.word,
      w.hindi_meaning,
      w.definition,
      w.prefix || "",
      w.suffix || "",
      (w.synonyms || []).join("; "),
      (w.antonyms || []).join("; "),
      w.example || "",
      w.status,
    ]
      .map(escapeCell)
      .join(","),
  );

  const csv = [headers.map(escapeCell).join(","), ...rows].join("\n");

  // add BOM so Excel renders Hindi (Devanagari) correctly instead of garbled text
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `vocab-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
