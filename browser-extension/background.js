// The native host stores only the active tab's title and a session-scoped ID.
// No URLs, browsing contents, or network requests leave this extension.
const host = "rimuru.screentime.tabs"
let port = null
let retryAfter = 0
let serial = 0

async function sessionId() {
  const saved = await chrome.storage.session.get("sessionId")
  if (saved.sessionId) return saved.sessionId
  const id = crypto.randomUUID()
  await chrome.storage.session.set({ sessionId: id })
  return id
}

function connection() {
  if (port) return port
  if (Date.now() < retryAfter) return null
  const next = chrome.runtime.connectNative(host)
  next.onDisconnect.addListener(() => {
    if (port === next) port = null
    retryAfter = Date.now() + 30000
    chrome.action.setBadgeText({ text: "!" })
    chrome.action.setTitle({ title: "Install the Rimuru native host to track exact tabs" })
  })
  port = next
  return port
}

async function report() {
  const current = ++serial
  try {
    const window = await chrome.windows.getLastFocused()
    const active = window && window.focused && window.id !== chrome.windows.WINDOW_ID_NONE
    const tabs = active ? await chrome.tabs.query({ active: true, windowId: window.id }) : []
    const tab = tabs[0]
    const id = tab ? await sessionId() : ""
    if (current !== serial) return
    const native = connection()
    if (!native) return
    native.postMessage(tab ? {
      active: true,
      id: id + ":" + tab.id,
      title: tab.title || ""
    } : { active: false })
    chrome.action.setBadgeText({ text: "" })
    chrome.action.setTitle({ title: "Rimuru Screen Time Tabs is connected" })
  } catch (error) {
    // Browser shutdown or a missing native host is retried on the next update.
  }
}

chrome.tabs.onActivated.addListener(report)
chrome.tabs.onUpdated.addListener(report)
chrome.tabs.onRemoved.addListener(report)
chrome.windows.onFocusChanged.addListener(report)
chrome.windows.onRemoved.addListener(report)
chrome.runtime.onStartup.addListener(report)
chrome.runtime.onInstalled.addListener(report)
setInterval(report, 2000)
report()
