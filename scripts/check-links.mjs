import { readFile, readdir, stat } from "node:fs/promises";
import { resolve, relative, extname, join } from "node:path";
import { parse } from "parse5";

const root = resolve("dist");
const html = new Map();
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collect(path);
    else if (entry.name.endsWith(".html"))
      html.set(path, parse(await readFile(path, "utf8")));
  }
}
function nodes(node) {
  return [node, ...(node.childNodes || []).flatMap(nodes)];
}
await collect(root);
const errors = [];
let links = 0;
for (const [path, document] of html) {
  const page = new URL(
    relative(root, path).replace(/index\.html$/, ""),
    "https://site.invalid/",
  );
  for (const node of nodes(document)) {
    for (const attribute of node.attrs || []) {
      if (!["href", "src"].includes(attribute.name)) continue;
      const target = new URL(attribute.value, page);
      if (target.origin !== page.origin) continue;
      links++;
      let file = resolve(root, "." + decodeURIComponent(target.pathname));
      if (!file.startsWith(root + "/") && file !== root) {
        errors.push(`${path}: invalid path`);
        continue;
      }
      if (!extname(file)) file = join(file, "index.html");
      try {
        await stat(file);
      } catch {
        errors.push(`${relative(root, path)} → ${attribute.value}`);
        continue;
      }
      if (target.hash && html.has(file)) {
        const id = decodeURIComponent(target.hash.slice(1));
        if (
          !nodes(html.get(file)).some((n) =>
            n.attrs?.some(
              (a) => (a.name === "id" || a.name === "name") && a.value === id,
            ),
          )
        )
          errors.push(`${relative(root, path)} → missing #${id}`);
      }
    }
  }
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `Links passed: ${html.size} HTML pages, ${links} internal links/assets (including fragments).`,
  );
