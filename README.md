<h1 align="center">
  <img src="icons/icon128.png" width="96" height="96" alt=""><br>
  Ferry
</h1>

<p align="center">
  Keep your chat and mail window free of stray tabs.<br>
  A Chrome extension that carries link-opened tabs to your browsing window.
</p>

---

Run Slack, Asana, Gmail, and Calendar as pinned tabs in one window, and do your actual
browsing in another. Click a link in Slack and Chrome opens it *right there*, cluttering
the window you wanted to keep clean. Ferry moves it across.

There is no native setting for this. Chrome always opens a link in the window that
initiated it, and the OS default-browser setting only governs links arriving from other
applications. Moving a tab between windows requires the extension APIs.

## Install

No build step, no bundler, no dependencies.

1. Clone this repo.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the folder.

Chrome will show a persistent "unpacked extensions" warning. Ignore it. After editing
`background.js`, reload from the extension card.

## Setup

Ferry assumes a layout, and does nothing at all without it:

- **Two normal Chrome windows, same profile.** Cross-profile routing is impossible —
  `tabs.move` cannot cross profiles.
- **Your apps pinned** in one of them.

Pinning is load-bearing, not cosmetic. Ferry triggers on tab *creation*, so a page that
navigates in place moves nothing. Chrome's pinned-tab behavior opens outbound links in a
new tab rather than navigating the pinned tab away from its site, and that conversion from
navigation into creation is the whole mechanism.

## How it works

**Which window is the source.** Whichever normal window has the most pinned tabs. Nothing
is hardcoded — no host list, no manual designation, no stored window ID. It is recomputed
on every event, so it survives restarts and window closes. With no pinned tabs anywhere,
there is no source and nothing routes.

**What moves.** On `tabs.onCreated`, three guards run in order. Any failure means do
nothing:

| Guard | Why |
|---|---|
| Tab is pinned | Never relocate an app tab itself. |
| Tab has no `openerTabId` | Only link-initiated tabs have an opener, so `Cmd-T` stays in whatever window you pressed it in. |
| Tab was not born in the apps window | Routing is one-directional. Tabs created in the browsing window are never touched. |

**Where it goes.** The first normal window that is not the apps window. If none exists, one
is created.

Ferry then activates the tab and raises the target window. It holds no state between
events, so the service worker sleeping is not something it has to reason about.

## Configuration

Everything is a constant at the top of `background.js`.

| Change | How |
|---|---|
| Stop focus stealing | Set `FOCUS_ON_MOVE = false` to let tabs accumulate quietly. |
| Route `Cmd-T` tabs too | Remove the `if (!tab.openerTabId) return;` guard. |
| Prefer the window you browsed in most recently | Cache the last focused non-apps window with a `chrome.windows.onFocusChanged` listener. Only matters with three or more windows. |

## Known limitations

These are expected. They are not worth fixing.

- **Brief flicker.** The tab is genuinely created in the apps window and then moved. No API
  creates a tab in a different window.
- **Same-tab navigations are invisible.** Only creations fire `onCreated`. This is why
  pinning matters.
- **Window placement is the OS's call.** When Ferry has to create a window, macOS decides
  where it lands. Use a window manager.
- **Incognito is inactive** unless you explicitly enable the extension there.
- **Roles can swap.** Pin more tabs in your browsing window than your apps window and the
  two trade places. With four pinned apps that takes five pins, but it is the thing to
  suspect if routing ever reverses.

## Icon

`icons/icon.svg` is the source for 48px and 128px. `icons/icon-small.svg` is a simplified
variant for 16px and 32px, where the detailed wake blurs into a band. Regenerate with:

```bash
cd icons
rsvg-convert -w 16  -h 16  icon-small.svg -o icon16.png
rsvg-convert -w 32  -h 32  icon-small.svg -o icon32.png
rsvg-convert -w 48  -h 48  icon.svg       -o icon48.png
rsvg-convert -w 128 -h 128 icon.svg       -o icon128.png
```

## License

MIT — see [LICENSE](LICENSE).
