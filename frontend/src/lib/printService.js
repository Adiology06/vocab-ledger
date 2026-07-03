export function printRevisionSheet(words, title) {
  const win = window.open("", "_blank");
  if (!win) {
    alert("Please allow pop-ups for this site to print your revision sheet.");
    return;
  }

  const rows = words
    .map(
      (w) => `
    <div class="sheet-word">
      <div class="sheet-headword">
        ${w.word}
        ${w.pos ? `<span class="sheet-pos">(${w.pos})</span>` : ""}
      </div>
      <table class="sheet-table">
        <tr><td class="label">Hindi meaning</td><td class="hindi">${w.hindi_meaning || "—"}</td></tr>
        <tr><td class="label">Definition</td><td>${w.definition || "—"}</td></tr>
        <tr><td class="label">Synonyms</td><td>${(w.synonyms || []).join(", ") || "—"}</td></tr>
        <tr><td class="label">Antonyms</td><td>${(w.antonyms || []).join(", ") || "—"}</td></tr>
        ${w.example ? `<tr><td class="label">Example</td><td class="ex">"${w.example}"</td></tr>` : ""}
      </table>
    </div>
  `,
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <link href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;600&family=Noto+Sans+Devanagari:wght@500;600&display=swap" rel="stylesheet">
      <style>
        body{font-family:'Inter',sans-serif;color:#1F2A3C;padding:30px;max-width:800px;margin:0 auto;}
        h1{font-family:'Lora',serif;font-size:24px;border-bottom:2px solid #1F2A3C;padding-bottom:10px;}
        .meta{font-size:12px;color:#666;margin-bottom:24px;}
        .sheet-word{margin-bottom:22px;page-break-inside:avoid;border-bottom:1px solid #ddd;padding-bottom:14px;}
        .sheet-headword{font-family:'Lora',serif;font-size:20px;font-weight:700;margin-bottom:6px;}
        .sheet-pos{font-size:12px;font-weight:400;color:#888;margin-left:6px;}
        .sheet-table{font-size:13px;width:100%;border-collapse:collapse;}
        .sheet-table td{padding:3px 8px 3px 0;vertical-align:top;}
        .label{color:#888;white-space:nowrap;width:110px;font-size:11px;text-transform:uppercase;}
        .hindi{font-family:'Noto Sans Devanagari',sans-serif;font-size:15px;font-weight:600;}
        .ex{font-style:italic;color:#555;}
        @media print{ body{padding:0;} }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <div class="meta">Vocabulary Ledger · ${words.length} word${words.length === 1 ? "" : "s"} · Generated ${new Date().toLocaleDateString()}</div>
      ${rows}
    </body>
    </html>
  `;

  win.document.write(html);
  win.document.close();
  win.onload = () => {
    win.focus();
    win.print();
  };
}
