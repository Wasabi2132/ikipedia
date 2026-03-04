// ============================================================
//  ❤うぃきぺでぃあ調教❤  —  content.js
// ============================================================

const CHAOS_KEY = "chaosEnabled";

// ---- 変換ルール ----

function transformText(text) {
  let t = text;

  // 1. 「行く」「いく」→ イ゛ク゛...
  t = t.replace(/行く|いく/g, "イ゛ク゛イ゛ク゛イ゛ク゛ゥ゛ッッ❤❤❤");

  // 2. 「する」→「しちゃう❤」、「した」→「しちゃった❤」
  t = t.replace(/する。/g, "しちゃう❤");
  t = t.replace(/した。/g, "しちゃった❤");

  // 3. 「！」→「！！❤」
  t = t.replace(/！/g, "！！❤");

  // 4. 「？」→「！？！！？❤」
  t = t.replace(/？/g, "！？！！？❤");

  // 5. 母音「あ」で終わる語末 + 読点 → 25%の確率で「ぁ゛っ゛❤」を読点の前に挿入❤
  //    対象: ひらがなで「は、」「が、」「では、」など、直前が「あ行」の仮名
  t = t.replace(/([\u3042\u3044\u3046\u3048\u304A\u304B-\u3093])(、)/g, (match, char, punct) => {
    const vowelA = /[あかさたなはまやらわぱばだざが]/;
    // 末尾文字の母音が「あ」に相当するかチェック
    const aEnding = /[あかさたなはまやらわぱばだざがぁ]/;
    if (aEnding.test(char) && Math.random() < 0.25) {
      return char + "ぁ゛っ゛❤" + punct;
    }
    return match;
  });

  // 6. 「ようこそ」を「ようこそお゛ぉ゛っ゛❤」に変換
  t = t.replace(/ようこそ/g, "ようこそお゛ぉ゛っ゛❤");

  // 7. 母音「お」で終わる語末 + 読点 → 語末文字に「ぉ゛っ゛❤」を付与
  //    対象: お・こ・そ・と・の・ほ・も・よ・ろ・を
  t = t.replace(/([おこそとのほもよろをごぞどぼぽぉ])(、)/g, (match, char) => {
    return char + "ぉ゛っ゛❤";
  });

  // 8. 「ん」で終わる語末 → 3択ランダム変換
  const nChoices = ["ん゛ほお゛ぉ゛ぉ゛❤", "んん…❤", "んっ❤"];
  t = t.replace(/ん/g, () => {
    return nChoices[Math.floor(Math.random() * nChoices.length)];
  });

  // 9. 「である。」を「なんだよぉ❤」に変換
  t = t.replace(/である。/g, "なんだよぉ❤");

  // 10. 「あった。」を「あった❤、」に変換
  t = t.replace(/あった。/g, "あった❤、");

  // 11. 「ない。」を「ないんだよぉ❤」に変換
  t = t.replace(/ない。/g, "ないんだよぉ❤");

  // 12. 句点を35%の確率で「❤」に変換
  t = t.replace(/。/g, () => Math.random() < 0.35 ? "❤" : "。");

  return t;
}

// ---- DOM操作 ----

// 変換対象外のタグ
const SKIP_TAGS = new Set([
  "SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT",
  "CODE", "PRE", "KBD", "SAMP", "VAR"
]);

// オリジナルテキストを保存するWeakMap
const originalTexts = new WeakMap();

function processNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const parent = node.parentElement;
    if (parent && SKIP_TAGS.has(parent.tagName)) return;
    const original = node.textContent;
    if (!original.trim()) return;
    if (!originalTexts.has(node)) {
      originalTexts.set(node, original);
    }
    const transformed = transformText(original);
    if (transformed !== original) {
      node.textContent = transformed;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    if (SKIP_TAGS.has(node.tagName)) return;
    node.childNodes.forEach(processNode);
  }
}

function restoreNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const original = originalTexts.get(node);
    if (original !== undefined) {
      node.textContent = original;
    }
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    node.childNodes.forEach(restoreNode);
  }
}

function applyChaosFull() {
  processNode(document.body);
}

function restoreAll() {
  restoreNode(document.body);
}

// ---- MutationObserver（動的追加テキスト対応）----

let observer = null;

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    mutations.forEach(({ addedNodes }) => {
      addedNodes.forEach((node) => processNode(node));
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function stopObserver() {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
}

// ---- メッセージ受信（popup.jsから） ----

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "enableChaos") {
    applyChaosFull();
    startObserver();
  } else if (msg.action === "disableChaos") {
    stopObserver();
    restoreAll();
  }
});

// ---- 初期化：ストレージの状態に応じて自動適用 ----

chrome.storage.local.get([CHAOS_KEY], (result) => {
  if (result[CHAOS_KEY]) {
    applyChaosFull();
    startObserver();
  }
});
