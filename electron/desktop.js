import { app } from "electron";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import metadata from "../package.json";

// Only AppImage and local development need this; installed packages handle it themselves.
export function registerIcon(iconPath, dev = false) {
  if (process.platform !== "linux" || (!dev && !process.env.APPIMAGE)) return;

  const id = metadata.desktopName.replace(/\.desktop$/, "") + (dev ? ".dev" : "");
  app.setDesktopName(`${id}.desktop`);
  try {
    const data = process.env.XDG_DATA_HOME || path.join(app.getPath("home"), ".local/share");
    const png = readFileSync(iconPath);
    // A changed image gets a new path so GNOME cannot reuse its cached old logo.
    const hash = createHash("sha256").update(png).digest("hex").slice(0, 12);
    const icon = path.join(data, "icons", `${id}-${hash}.png`);
    const args = dev ? [process.execPath, app.getAppPath()] : [process.env.APPIMAGE];
    mkdirSync(path.dirname(icon), { recursive: true });
    writeFileSync(icon, png);
    mkdirSync(path.join(data, "applications"), { recursive: true });
    writeFileSync(path.join(data, "applications", `${id}.desktop`), [
      "[Desktop Entry]", "Type=Application",
      `Name=${escapeValue(metadata.productName || metadata.name)}${dev ? " (Development)" : ""}`,
      `Exec=${args.map(quoteArgument).join(" ")}`,
      `Icon=${escapeValue(icon)}`, `StartupWMClass=${id}`, "",
    ].join("\n"));
  } catch (error) {
    console.warn("Could not register desktop icon:", error.message);
  }
}

// Desktop entry escaping is different from shell quoting.
function escapeValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}

function quoteArgument(value) {
  return escapeValue('"' + value.replace(/[\\"`$]/g, "\\$&")
    .replace(/%/g, "%%") + '"');
}
