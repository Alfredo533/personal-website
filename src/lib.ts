import { getCollection } from "astro:content";
export async function publicArticles() {
  return (
    await getCollection(
      "writing",
      ({ data }) => data.approval === "author-approved",
    )
  ).sort((a, b) => b.data.date.localeCompare(a.data.date));
}
export function formatDate(date: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Shanghai",
  }).format(new Date(`${date}T00:00:00+08:00`));
}
