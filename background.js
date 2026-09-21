// Set false to let routed tabs accumulate without pulling focus to the other display.
const FOCUS_ON_MOVE = true;

// The apps window is whichever normal window has the most pinned tabs. Counting, rather
// than treating any pinned tab as the marker, keeps exactly one window eligible as a
// source — otherwise pinning something in the browsing window makes both windows sources
// and leaves the router with nowhere to move tabs to.
async function findAppsWindowId() {
  let pinned;
  try {
    pinned = await chrome.tabs.query({ pinned: true, windowType: "normal" });
  } catch {
    return null;
  }
  const counts = new Map();
  for (const t of pinned) counts.set(t.windowId, (counts.get(t.windowId) || 0) + 1);

  let bestId = null;
  let bestCount = 0;
  for (const [id, n] of counts) {
    if (n > bestCount) {
      bestId = id;
      bestCount = n;
    }
  }
  return bestId;
}

async function findBrowsingWindow(excludeId) {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });
  const match = windows.find((w) => w.id !== excludeId);
  return match ? match.id : null;
}

// tabs.move throws if the user happens to be dragging a tab. Retry briefly.
async function moveWithRetry(tabId, windowId, attempts = 5, delayMs = 100) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await chrome.tabs.move(tabId, { windowId, index: -1 });
    } catch (e) {
      if (i === attempts - 1) {
        console.warn("link-router: move failed", e);
        return null;
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}

chrome.tabs.onCreated.addListener(async (tab) => {
  if (tab.pinned) return;
  if (!tab.openerTabId) return;

  const appsId = await findAppsWindowId();
  if (appsId === null || tab.windowId !== appsId) return;

  const target = await findBrowsingWindow(appsId);

  if (target === null) {
    await chrome.windows.create({ tabId: tab.id, focused: FOCUS_ON_MOVE });
    return;
  }

  const moved = await moveWithRetry(tab.id, target);
  if (!moved) return;

  await chrome.tabs.update(tab.id, { active: true });
  if (FOCUS_ON_MOVE) await chrome.windows.update(target, { focused: true });
});
