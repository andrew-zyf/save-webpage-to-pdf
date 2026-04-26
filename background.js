// Service worker：注册右键菜单 + 共用打印流程。
const RESTRICTED = /^(chrome|edge|about|chrome-extension|view-source|devtools):|^https:\/\/chrome\.google\.com\/webstore|^https:\/\/chromewebstore\.google\.com/;

const MENU_ITEMS = [
  { id: 'a4lp-reading', title: 'Save Webpage to PDF — 阅读版', mode: 'reading' },
  { id: 'a4lp-archive', title: 'Save Webpage to PDF — 归档版', mode: 'archive' },
];

function ensureMenus() {
  chrome.contextMenus.removeAll(() => {
    MENU_ITEMS.forEach(item => {
      chrome.contextMenus.create({
        id: item.id,
        title: item.title,
        contexts: ['page', 'selection', 'link'],
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(ensureMenus);
chrome.runtime.onStartup.addListener(ensureMenus);

async function runFlow(tabId, options) {
  await chrome.scripting.insertCSS({ target: { tabId }, files: ['print.css'] });
  await chrome.scripting.executeScript({ target: { tabId }, files: ['flow.js'] });
  await chrome.scripting.executeScript({
    target: { tabId },
    func: (opts) => { if (window.__a4lpStart) return window.__a4lpStart(opts); },
    args: [options || {}],
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const item = MENU_ITEMS.find(m => m.id === info.menuItemId);
  if (!item || !tab?.id) return;
  if (!tab.url || RESTRICTED.test(tab.url)) {
    console.warn('[Save Webpage] 当前页面受 Chrome 限制，无法注入。');
    return;
  }
  try {
    await runFlow(tab.id, { layoutMode: item.mode });
  } catch (e) {
    console.error('[Save Webpage] 右键打印失败：', e);
  }
});
