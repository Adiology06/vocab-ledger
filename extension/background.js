chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "wordjar-lookup",
    title: 'Look up "%s" in WordJar',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "wordjar-lookup" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: "CONTEXT_LOOKUP",
      word: info.selectionText,
    });
  }
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SESSION_UPDATE") {
    chrome.storage.local.set({ wordjar_session: message.session });
  }
});
