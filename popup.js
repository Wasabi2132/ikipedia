const CHAOS_KEY = "chaosEnabled";
const btn = document.getElementById("toggleBtn");
const status = document.getElementById("status");

function setUI(enabled) {
  if (enabled) {
    btn.textContent = "❤教育完了❤";
    btn.className = "toggle-btn on";
    status.textContent = "❤わからせる❤";
    status.className = "status active";
  } else {
    btn.textContent = "❤わからせる❤";
    btn.className = "toggle-btn off";
    status.textContent = "";
    status.className = "status";
  }
}

// 現在の状態を読み込む
chrome.storage.local.get([CHAOS_KEY], (result) => {
  setUI(!!result[CHAOS_KEY]);
});

btn.addEventListener("click", () => {
  chrome.storage.local.get([CHAOS_KEY], (result) => {
    const current = !!result[CHAOS_KEY];
    const next = !current;

    chrome.storage.local.set({ [CHAOS_KEY]: next }, () => {
      setUI(next);

      // アクティブタブのcontent.jsにメッセージ送信
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        const url = tabs[0].url || "";
        if (!url.includes("wikipedia.org")) return;

        chrome.tabs.sendMessage(tabs[0].id, {
          action: next ? "enableChaos" : "disableChaos"
        });
      });
    });
  });
});
