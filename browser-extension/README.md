# Chromium tab companion

The Screen Time plugin can infer the active Chromium tab from its window title without an extension. This companion gives each open tab its own session ID, so two tabs with the same title show separately. It sends the active tab's title and ID to a local native host; it does not send a URL or page content.

1. Install or update the Screen Time plugin and restart the Omarchy shell.
2. In Brave, Chromium, Chrome, Vivaldi or Edge, open the browser's extensions page, enable Developer mode, choose **Load unpacked**, and select this `browser-extension` directory.
3. Copy the 32-letter extension ID shown on that page.
4. From the repository root, run `python3 python/browser_tab_host.py --install brave EXTENSION_ID` (replace `brave` with `brave-nightly`, `brave-beta`, `chromium`, `chrome`, `vivaldi` or `edge` as appropriate). This installs a user-level native messaging manifest for that browser.
5. Run `chmod +x python/browser_tab_host.py`, then reload the extension. Its badge should no longer show `!`. Restart the Omarchy shell if it was running before the plugin update.

The extension directory and host script must remain at their installed paths. The host writes only `~/.local/share/omarchy-screentime/browser-tab.json`; the plugin stores active-tab durations in its normal history file. Each Chromium profile needs the extension loaded. If the host is unavailable, title-based tracking continues, but equal titles share a row.

In Screen Time settings, pick a tab chip and enter a duration to limit that individual open tab. The exact ID lasts for that browser session; use `tab:<title>` for a recurring title-based limit. Limits work like app limits: a notification and urgent bar colour when reached, with no browser blocking.
