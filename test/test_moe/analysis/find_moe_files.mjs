import { readFile, readdir, realpath, stat } from "node:fs/promises";
import path from "node:path";
import { xml2js } from "xml-js";

const root = process.argv[2];

const ignore = {
  story: {
    child: new Set(["settings"]),
  },
  TitleItem: {
    attr: new Set(["included", "words"]),
  },
  GroupItem: {
    attr: new Set(["alterable", "level", "words"]),
  },
  SceneItem: {
    attr: new Set(["words"]),
  },
};

const mergeElements = new Set(["TitleItem", "GroupItem", "SceneItem"]);

if(!root) {
  console.error("Usage: node test/test_moe/analysis/find_moe_files.mjs <path>");
  process.exit(1);
}

const files = await findMoeFiles(root);
const analysis = await analyzeFiles(files);

console.log(`MOE files found: ${files.length}`);
printAnalysis(analysis);

async function findMoeFiles(root) {
  const found = [];

  await visit(path.resolve(root), new Set());

  return found;

  async function visit(fileid, ancestors) {
    const directory = await realpath(fileid);

    if(ancestors.has(directory)) return;

    const entries = await readdir(fileid, { withFileTypes: true });
    const childAncestors = new Set([...ancestors, directory]);

    for(const entry of entries) {
      const child = path.join(fileid, entry.name);
      const childStat = await stat(child).catch(() => undefined);

      if(!childStat) continue;

      if(childStat.isDirectory()) {
        await visit(child, childAncestors);
      } else if(childStat.isFile() && isMoeFile(entry.name)) {
        found.push(child);
      }
    }
  }
}

function isMoeFile(filename) {
  return filename.endsWith(".moe") || filename.endsWith(".moex");
}

async function analyzeFiles(files) {
  const roots = new Map();
  const merged = new Map();
  const errors = [];

  for(const file of files) {
    try {
      const root = await readXmlRoot(file);

      analyzeElement({ roots, merged }, getRootAnalysis(roots, root.name), root);
    } catch(error) {
      errors.push({ file, error });
    }
  }

  return { roots, merged, errors };
}

async function readXmlRoot(file) {
  const content = await readFile(file, "utf8");
  const tree = xml2js(content, {
    compact: false,
    ignoreComment: true,
  });
  const root = tree.elements?.find(elem => elem.type === "element");

  if(!root) throw new Error("XML has no root element");

  return root;
}

function analyzeElement(analysis, item, element) {
  const children = childElements(element);

  item.count += 1;
  addAttributes(item.attributes, element);

  for(const child of children) {
    analyzeElement(analysis, getChildAnalysis(analysis, item, child.name), child);
  }
}

function getRootAnalysis(roots, name) {
  if(!roots.has(name)) {
    roots.set(name, createElementAnalysis());
  }
  return roots.get(name);
}

function getChildAnalysis(analysis, parent, name) {
  if(mergeElements.has(name)) {
    const child = getRootAnalysis(analysis.merged, name);
    parent.children.set(name, child);
    return child;
  }

  if(!parent.children.has(name)) {
    parent.children.set(name, createElementAnalysis());
  }
  return parent.children.get(name);
}

function createElementAnalysis() {
  return {
      count: 0,
      attributes: new Map(),
      children: new Map(),
  };
}

function printAnalysis(analysis) {
  console.log("");

  for(const [name, element] of sortedEntries(analysis.roots)) {
    printHierarchy(name, element);
  }

  console.log("");

  for(const [name, element] of sortedEntries(analysis.merged)) {
    printElementDetails(name, element);
  }

  if(analysis.errors.length) {
    console.log("");
    console.log(`Errors: ${analysis.errors.length}`);
    for(const { file, error } of analysis.errors) {
      console.log(`- ${file}: ${error.message}`);
    }
  }
}

function printHierarchy(name, element, indent = "", seen = new Set()) {
  const merged = mergeElements.has(name) ?? seen.has(element);

  console.log(`${indent}- ${name}${merged ? " (merged)" : ""}: ${element.count}`);

  if(merged) {
    return;
  }

  const nextSeen = new Set([...seen, element]);

  printAttributeLine(element.attributes, indent + "  ");

  for(const [childName, child] of sortedEntries(element.children)) {
    printHierarchy(childName, child, indent + "    ", nextSeen);
  }
}

function printElementDetails(name, element, indent = "") {
  console.log(`- ${name}: ${element.count}`);
  printAttributeLine(element.attributes);

  printChildrenHeader(element.children, indent + "  ");
  for(const [childName, child] of sortedEntries(element.children)) {
    printNestedElementDetails(childName, child, indent + "  ");
  }
}

function printNestedElementDetails(name, element, indent) {
  const merged = mergeElements.has(name);
  console.log(`${indent}- ${name}${merged ? " (merged)" : ""}: ${element.count}`);

  if(mergeElements.has(name)) {
    return;
  }

  printAttributeLine(element.attributes, indent + "  ");
  printChildrenHeader(element.children, indent + "  ");

  for(const [childName, child] of sortedEntries(element.children)) {
    printNestedElementDetails(childName, child, indent + "  ");
  }
}

function childElements(element) {
  const ignored = ignore[element.name]?.child ?? new Set();

  return (element.elements ?? []).filter(child => (
    child.type === "element" && !ignored.has(child.name)
  ));
}

function addAttributes(attributes, element) {
  const ignored = ignore[element.name]?.attr ?? new Set();

  for(const [name, value] of Object.entries(element.attributes ?? {})) {
    if(ignored.has(name)) continue;
    if(!attributes.has(name)) attributes.set(name, new Set());
    attributes.get(name).add(value);
  }
}

function printAttributeLine(attributes, indent = "  ") {
  if(!attributes.size) return;

  console.log(`${indent}Attributes: ${attributes.size}`);
  for(const [name, values] of sortedEntries(attributes)) {
    console.log(`${indent}- ${name}: ${formatValues(values)}`);
  }
}

function printChildrenHeader(children, indent = "  ") {
  if(!children.size) return;
  console.log(`${indent}Children: ${children.size}`);
}

function formatValues(values) {
  return sorted(values).map(value => JSON.stringify(value)).join(", ");
}

function sorted(values) {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function sortedEntries(map) {
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}
