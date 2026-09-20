import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

import { exit } from "node:process";
import path from "node:path";
import { homedir } from "node:os";

import metadata from "../package.json" with {type: "json"};

const {name, desktopName} = metadata
const profileName = desktopName?.replace(/\.desktop$/, "") ?? name

// Temporarily disabled
//return

if(process.platform !== "linux") exit();

console.log("Creating desktop file...")

const datadir = process.env.XDG_DATA_HOME || path.join(homedir(), ".local", "share");
const appdir  = path.join(datadir, "applications");
const icondir = path.join(datadir, "icons");

const appfile  = path.join(appdir, `${profileName}.desktop`);
const iconfile = path.join(icondir, `${profileName}.png`);

console.log("Data dir:", datadir);
console.log("App dir.:", appdir);
console.log("App file:", appfile);
console.log("Icon dir:", icondir);
console.log("Icon file:", iconfile);

//-----------------------------------------------------------------------------
// Copy icon
//-----------------------------------------------------------------------------

const png = readFileSync("./src/icon.png");
// A changed image gets a new path so GNOME cannot reuse its cached old logo.
//const hash = createHash("sha256").update(png).digest("hex").slice(0, 12);
mkdirSync(icondir, { recursive: true });
writeFileSync(iconfile, png);

//-----------------------------------------------------------------------------
// Create .desktop file
//-----------------------------------------------------------------------------

mkdirSync(appdir, { recursive: true });
writeFileSync(appfile, [
  "[Desktop Entry]",
  "Type=Application",
  `Name=${escapeValue(metadata.name)}`,
  `Icon=${escapeValue(iconfile)}`,
  //`Exec=${args.map(quoteArgument).join(" ")}`,
  //`StartupWMClass=${id}`,
  "",
].join("\n"));

/*
//app.setDesktopName(`${id}`);
*/

// Desktop entry escaping is different from shell quoting.
function escapeValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r").replace(/\t/g, "\\t");
}

function quoteArgument(value) {
  return escapeValue('"' + value.replace(/[\\"`$]/g, "\\$&")
    .replace(/%/g, "%%") + '"');
}
