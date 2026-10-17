import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  checkArticle,
  contentDigest,
  checkPublic,
} from "../scripts/check-public.mjs";

const metadata = {
  title: "测试标题",
  description: "测试摘要",
  date: "2026-10-17",
  category: "philosophy",
  tags: ["测试"],
  approval: "author-approved",
};
const body = "这是自动化测试的合成文字，不是作者文章。\n";
function article(changes = {}, text = body) {
  const data = {
    ...metadata,
    approvalDigest: contentDigest(metadata, body),
    ...changes,
  };
  return (
    "---\n" +
    Object.entries(data)
      .map(([k, v]) => `${k}: ${JSON.stringify(v)}`)
      .join("\n") +
    "\n---\n" +
    text
  );
}
test("public source tree contains no private directories or credentials", async () => {
  assert.ok((await checkPublic()) > 0);
});
test("approved exact content and metadata pass", () => {
  assert.equal(checkArticle(article(), "test.md").approval, "author-approved");
});
test("unapproved article is rejected", () => {
  assert.throws(
    () => checkArticle(article({ approval: "pending" }), "test.md"),
    /approval/,
  );
});
test("body changed after approval is rejected", () => {
  assert.throws(
    () => checkArticle(article({}, body + "变更"), "test.md"),
    /changed/,
  );
});
test("metadata changed after approval is rejected", () => {
  assert.throws(
    () => checkArticle(article({ title: "改动标题" }), "test.md"),
    /changed/,
  );
});
test("private metadata is rejected", () => {
  assert.throws(
    () => checkArticle(article({ source: "private-source" }), "test.md"),
    /private metadata/,
  );
});
test("new placeholder cannot bypass approval", () => {
  assert.throws(
    () => checkArticle(article({ approval: "placeholder" }), "new.md"),
    /placeholder/,
  );
});
test("approved fixed placeholder renders separately", async () => {
  const text = await readFile(
    new URL("../src/content/writing/format-preview.md", import.meta.url),
    "utf8",
  );
  const hash = (
    await readFile(
      new URL("../scripts/placeholder.sha256", import.meta.url),
      "utf8",
    )
  ).trim();
  assert.equal(
    checkArticle(text, "format-preview.md", hash).approval,
    "placeholder",
  );
});
test("invalid calendar date is rejected", () => {
  assert.throws(
    () => checkArticle(article({ date: "2026-02-31" }), "test.md"),
    /date/,
  );
});
