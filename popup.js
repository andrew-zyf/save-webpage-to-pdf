// ---- popup UI（实际抽取/打印逻辑在 flow.js，由 popup 与 background 共用）----
const $ = (id) => document.getElementById(id);

async function getTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

function showError(msg) {
  let el = document.getElementById('err');
  if (!el) {
    el = document.createElement('div');
    el.id = 'err';
    el.style.cssText = 'margin-top:8px;padding:6px 8px;border-radius:4px;background:#fde7e7;color:#a30000;font-size:11px;white-space:pre-wrap;word-break:break-word;';
    document.body.appendChild(el);
  }
  el.textContent = msg;
}

const SETTINGS_KEY = 'save-webpage-to-pdf.options.v1';
const RESTRICTED = /^(chrome|edge|about|chrome-extension|view-source|devtools):|^https:\/\/chrome\.google\.com\/webstore|^https:\/\/chromewebstore\.google\.com/;

function loadOptions() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return {};
  }
}

function getOptions() {
  return {
    layoutMode: $('layoutMode')?.value === 'archive' ? 'archive' : 'reading',
  };
}

function saveOptions() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(getOptions()));
  } catch {}
}

function initOptions() {
  const saved = loadOptions();
  if ($('layoutMode')) $('layoutMode').value = saved.layoutMode === 'archive' ? 'archive' : 'reading';
  ['layoutMode'].forEach(id => {
    const el = $(id);
    if (el) el.addEventListener('change', saveOptions);
  });
}

async function runFlow(tabId, options) {
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['print.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['flow.js'] });
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (opts) => { if (window.__a4lpStart) return window.__a4lpStart(opts); },
    args: [options || {}],
  });
}

function bind(id, handler) {
  $(id).addEventListener('click', async () => {
    const btn = $(id);
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '处理中…';
    try {
      const tab = await getTab();
      if (!tab?.id) throw new Error('无可用标签');
      if (!tab.url || RESTRICTED.test(tab.url)) {
        throw new Error('当前页面受 Chrome 限制（chrome://、Web Store、PDF 等），扩展无法注入脚本。请在普通网页上使用。');
      }
      const options = getOptions();
      saveOptions();
      await handler(tab, options);
      btn.textContent = '完成 ✓';
      setTimeout(() => window.close(), 600);
    } catch (e) {
      console.error('[Save Webpage]', e);
      showError((e && e.message) || String(e));
      btn.disabled = false;
      btn.textContent = original;
    }
  });
}

initOptions();

bind('pdf', async (tab, options) => {
  await runFlow(tab.id, options);
});
