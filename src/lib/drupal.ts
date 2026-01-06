export type DrupalPost = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  body: string;
  introText?: string;
  coverUrl?: string;
  date?: string;
  category?: string | string[];
  readTime?: number;
};

const API_BASE =
  import.meta.env.DRUPAL_API_BASE || "http://217.154.85.224:8081";

const POSTS_ENDPOINT = `${API_BASE}/jsonapi/node/codariq_blog`;

const apiOrigin = (() => {
  try {
    return new URL(API_BASE).origin;
  } catch {
    return API_BASE;
  }
})();

function normalizeUrl(url: string | undefined) {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  if (url.startsWith("//")) return `http:${url}`;
  if (url.startsWith("/")) return `${apiOrigin}${url}`;
  return url;
}

function extractCoverUrl(included: any[] | undefined, rel: any) {
  if (!included || !rel?.data) return undefined;
  const relData = Array.isArray(rel.data) ? rel.data[0] : rel.data;
  const file = included.find(
    (item) => item.type === relData?.type && item.id === relData?.id,
  );

  if (!file?.attributes) return undefined;

  // Drupal can expose uri.url or url; prefer uri.url.
  return normalizeUrl(
    file.attributes?.uri?.url ||
      file.attributes?.url ||
      file.attributes?.uri?.value ||
      undefined,
  );
}

function mapNode(node: any, included: any[]): DrupalPost {
  const attrs = node.attributes || {};
  const relationships = node.relationships || {};

  const coverUrl = extractCoverUrl(included, relationships.field_cover);
  const alias: string = attrs?.path?.alias || "";
  const slug = alias.replace(/^\/+/, "").replace(/^blog\//, "") || node.id;

  const mainBody =
    attrs?.field_body_content?.processed ||
    attrs?.field_body_content?.value ||
    attrs?.body?.processed ||
    attrs?.body?.value ||
    attrs?.body?.summary ||
    "";

  const introText =
    attrs?.field_intro_text?.processed ||
    attrs?.field_intro_text?.value ||
    attrs?.field_intro_text ||
    "";

  const mainSummary =
    attrs?.field_body_content?.summary ||
    attrs?.body?.summary ||
    attrs?.field_body_content?.processed ||
    attrs?.field_body_content?.value ||
    attrs?.body?.processed ||
    attrs?.body?.value ||
    "";

  return {
    id: node.id,
    slug,
    title: attrs.title || "Ohne Titel",
    summary: mainSummary,
    body: mainBody,
    introText,
    coverUrl,
    date: attrs?.field_datum,
    category: attrs?.field_kategorie,
    readTime: attrs?.field_read_time,
  };
}

export async function fetchDrupalPosts(limit = 6): Promise<DrupalPost[]> {
  const url = `${POSTS_ENDPOINT}?sort=-field_datum&include=field_cover&page[limit]=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drupal API error: ${res.status}`);
    const data = await res.json();
    const included = data?.included || [];
    return (data?.data || []).map((node: any) => mapNode(node, included));
  } catch (err) {
    console.error("Failed to fetch Drupal posts", err);
    return [];
  }
}

export async function fetchDrupalPostBySlug(
  slug: string,
): Promise<DrupalPost | null> {
  // Try direct filter by alias
  const alias = `/blog/${slug}`;
  const url = `${POSTS_ENDPOINT}?filter[path][alias]=${encodeURIComponent(
    alias,
  )}&include=field_cover&fields[node--codariq_blog]=title,body,field_cover,field_datum,field_kategorie,field_read_time,path&fields[file--file]=uri,url`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drupal API error: ${res.status}`);
    const data = await res.json();
    const included = data?.included || [];
    const node = data?.data?.[0];
    if (!node) return null;
    return mapNode(node, included);
  } catch (err) {
    console.error("Failed to fetch Drupal post by slug", err);
    const posts = await fetchDrupalPosts(50);
    return posts.find((p) => p.slug === slug) || null;
  }
}
