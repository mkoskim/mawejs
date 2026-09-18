import { app } from "electron";
import {is} from '@electron-toolkit/utils'

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import metadata from "../package.json";

// Only AppImage and local development need this; installed packages handle it themselves.
export function registerIcon(iconPath) {

  // Temporarily disabled
  //return

  if(process.platform !== "linux") return;
  //if(!is.dev) return;
  //if(!process.env.APPIMAGE) return;

  console.log("Registering desktop icon:", iconPath);

  const datadir = process.env.XDG_DATA_HOME || path.join(app.getPath("home"), ".local/share");
  const appdir  = path.join(datadir, "applications");
  const icondir = path.join(datadir, "icons");

  const appfile = path.join(appdir, `${metadata.desktopName}.desktop`);

  console.log("Data dir:", datadir);
  console.log("App dir.:", appdir);
  console.log("Icon dir:", icondir);
  console.log("App file:", appfile);

  //const iconfile = path.join(datadir, "icons", `${id}-${hash}.png`);

  //const id = metadata.desktopName.replace(/\.desktop$/, "");
  //const args = dev ? [process.execPath, app.getAppPath()] : [process.env.APPIMAGE];

  /*
  //app.setDesktopName(`${id}`);
  writeFileSync(appfile, [
    "[Desktop Entry]",
    "Type=Application",
    `Name=${escapeValue(metadata.productName || metadata.name)}`,
    //`Exec=${args.map(quoteArgument).join(" ")}`,
    //`Icon=${escapeValue(icon)}`,
    //`StartupWMClass=${id}`,
    "",
  ].join("\n"));
  */

  /*
  try {
    const png = readFileSync(iconPath);
    // A changed image gets a new path so GNOME cannot reuse its cached old logo.
    const hash = createHash("sha256").update(png).digest("hex").slice(0, 12);
    mkdirSync(path.dirname(icon), { recursive: true });
    writeFileSync(icon, png);
    mkdirSync(path.join(data, "applications"), { recursive: true });
  } catch (error) {
    console.warn("Could not register desktop icon:", error.message);
  }
  */
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
