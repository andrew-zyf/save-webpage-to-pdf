// Service worker：注册右键菜单 + 共用打印流程。
const RESTRICTED = /^(chrome|edge|about|chrome-extension|view-source|devtools):|^https:\/\/chrome\.google\.com\/webstore|^https:\/\/chromewebstore\.google\.com/;

const MENU_ID = 'a4lp-save-pdf';

function ensureMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Save Webpage to PDF',
      contexts: ['page', 'selection', 'link'],
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
  if (info.menuItemId !== MENU_ID || !tab?.id) return;
  if (!tab.url || RESTRICTED.test(tab.url)) {
    console.warn('[Save Webpage] 当前页面受 Chrome 限制，无法注入。');
    return;
  }
  try {
    await runFlow(tab.id, { layoutMode: 'archive' });
  } catch (e) {
    console.error('[Save Webpage] 右键打印失败：', e);
  }
});

// 快捷键：Alt+Shift+P（macOS 上 Alt = Option）
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'save-pdf') return;
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;
  if (!tab.url || RESTRICTED.test(tab.url)) {
    console.warn('[Save Webpage] 当前页面受 Chrome 限制，无法注入。');
    return;
  }
  try {
    await runFlow(tab.id, { layoutMode: 'archive' });
  } catch (e) {
    console.error('[Save Webpage] 快捷键触发失败：', e);
  }
});
