// Runs ONLY on self-vocab.vercel.app — reads the Supabase session that page already has,
// and hands it to the extension's storage. Never runs on any other website.
function syncSession() {
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k.startsWith("sb-") && k.endsWith("-auth-token"),
    );
    if (!keys.length) {
      chrome.runtime.sendMessage({ type: "SESSION_UPDATE", session: null });
      return;
    }
    const raw = localStorage.getItem(keys[0]);
    const parsed = JSON.parse(raw);
    chrome.runtime.sendMessage({
      type: "SESSION_UPDATE",
      session: {
        access_token: parsed.access_token,
        user_id: parsed.user?.id,
        email: parsed.user?.email,
        expires_at: parsed.expires_at,
      },
    });
  } catch {
    chrome.runtime.sendMessage({ type: "SESSION_UPDATE", session: null });
  }
}

syncSession();
window.addEventListener("storage", syncSession);
setInterval(syncSession, 30000); // catch login/logout even without a storage event
