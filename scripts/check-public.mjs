import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve, relative, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

const root = fileURLToPath(new URL("../", import.meta.url));
export function contentDigest(data, body) {
  return createHash("sha256")
    .update(
      [
        data.title,
        data.description,
        data.date,
        data.category,
        JSON.stringify(data.tags),
        body,
      ].join("\n"),
    )
    .digest("hex");
}
export function checkArticle(text, name, placeholderDigest) {
  const match = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(text);
  if (!match) throw new Error(`${name}: missing frontmatter`);
  const data = parse(match[1]);
  const body = match[2].trim() + "\n";
  const allowed = new Set([
    "title",
    "description",
    "date",
    "category",
    "tags",
    "approval",
    "approvalDigest",
  ]);
  if (Object.keys(data).some((k) => !allowed.has(k)))
    throw new Error(`${name}: unexpected private metadata`);
  if (!["wealth", "health", "philosophy"].includes(data.category))
    throw new Error(`${name}: invalid category`);
  for (const key of ["title", "description", "date"]) {
    if (
      typeof data[key] !== "string" ||
      !data[key].trim() ||
      /[\r\n]/.test(data[key])
    )
      throw new Error(`${name}: invalid ${key}`);
  }
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(data.date) ||
    !Number.isFinite(Date.parse(data.date)) ||
    new Date(data.date).toISOString().slice(0, 10) !== data.date
  )
    throw new Error(`${name}: invalid date`);
  if (
    !Array.isArray(data.tags) ||
    data.tags.some(
      (t) => typeof t !== "string" || !t.trim() || /[\r\n]/.test(t),
    )
  )
    throw new Error(`${name}: invalid tags`);
  if (data.approval === "placeholder") {
    if (
      name !== "format-preview.md" ||
      createHash("sha256").update(text).digest("hex") !== placeholderDigest
    )
      throw new Error(`${name}: unreviewed placeholder`);
  } else if (
    data.approval !== "author-approved" ||
    data.approvalDigest !== contentDigest(data, body)
  ) {
    throw new Error(
      `${name}: missing approval or content changed after approval`,
    );
  }
  if (
    /<\s*(script|iframe|object|embed)\b|\bon\w+\s*=|(?:javascript|data|file):/i.test(
      body,
    )
  )
    throw new Error(`${name}: active or unsafe content`);
  if (/^## (Draft Notes|Publication Record|Archive Notes)\s*$/m.test(body))
    throw new Error(`${name}: private entry sections`);
  return data;
}

export async function checkPublic(directory = root) {
  const forbidden = new Set([
    "context",
    "daily",
    "entries",
    "ideas",
    "drafts",
    "experiments",
    "published",
    "reviews",
    "knowledge",
  ]);
  const ignored = new Set([
    ".git",
    "node_modules",
    "dist",
    ".astro",
    ".local",
    "test-results",
    "playwright-report",
  ]);
  const digest = (
    await readFile(resolve(directory, "scripts/placeholder.sha256"), "utf8")
  ).trim();
  let count = 0;
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = resolve(dir, entry.name);
      const name = relative(directory, path);
      if (entry.isSymbolicLink())
        throw new Error(`${name}: symlinks forbidden`);
      if (entry.isDirectory()) {
        if (forbidden.has(entry.name))
          throw new Error(`${name}: private directory in public repository`);
        if (!ignored.has(entry.name)) await walk(path);
        continue;
      }
      if (
        (/^\.env(?:\.|$)/.test(entry.name) && entry.name !== ".env.example") ||
        /\.(pem|key)$/.test(entry.name)
      )
        throw new Error(`${name}: secret file`);
      const text = await readFile(path, "utf8");
      if (
        /(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|sk-(?:proj-)?[A-Za-z0-9_-]{30,}|xox[baprs]-[A-Za-z0-9-]{20,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)/.test(
          text,
        )
      )
        throw new Error(`${name}: potential credential`);
      if (
        /\/Users\/|Human_3_0_Project_Context|iCloud~md~obsidian/.test(text) &&
        !name.startsWith("scripts/check-public.")
      )
        throw new Error(`${name}: private local context reference`);
      if (name.startsWith("src/content/")) {
        if (!/^src\/content\/writing\/[a-z0-9]+(?:-[a-z0-9]+)*\.md$/.test(name))
          throw new Error(`${name}: unexpected content location`);
        checkArticle(text, basename(name), digest);
      }
      count++;
    }
  }
  await walk(directory);
  return count;
}
if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  try {
    console.log(
      `Public separation check passed (${await checkPublic()} source files).`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
