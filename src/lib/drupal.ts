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
  featured?: boolean;
};

const API_BASE =
  import.meta.env.DRUPAL_API_BASE || "https://cms.codariq.de";

const POSTS_ENDPOINT = `${API_BASE}/jsonapi/node/codariq_blog`;

function normalizeUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;

  // Already a complete URL - return as is
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // Absolute path - prepend API base
  if (url.startsWith("/")) return `${API_BASE}${url}`;

  // Drupal internal URI like "public://images/cover.webp"
  if (url.startsWith("public://")) {
    return `${API_BASE}/sites/default/files/${url.slice(9)}`;
  }

  return undefined;
}

function extractCoverUrl(included: any[] | undefined, rel: any): string | undefined {
  if (!included || !rel?.data) return undefined;

  const relData = Array.isArray(rel.data) ? rel.data[0] : rel.data;
  const file = included.find(
    (item) => item.type === relData?.type && item.id === relData?.id,
  );

  if (!file?.attributes) return undefined;

  // Check common Drupal URL patterns
  const rawUrl =
    file.attributes?.uri?.url ||
    file.attributes?.url ||
    file.attributes?.uri?.value;

  return normalizeUrl(rawUrl);
}

// Helper function to extract field values with fallback chain
function getFieldValue(
  attrs: any,
  fieldNames: string[],
  fallback: string = ""
): string {
  for (const field of fieldNames) {
    const value = attrs?.[field]?.processed || attrs?.[field]?.value || attrs?.[field];
    if (value) return value;
  }
  return fallback;
}

function mapNode(node: any, included: any[]): DrupalPost {
  const attrs = node.attributes || {};
  const relationships = node.relationships || {};

  const coverUrl = extractCoverUrl(included, relationships.field_cover);
  const alias: string = attrs?.path?.alias || "";
  const slug = alias.replace(/^\/+/, "").replace(/^blog\//, "") || node.id;

  const mainBody = getFieldValue(attrs, ['field_body_content', 'body']);
  const introText = getFieldValue(attrs, ['field_intro_text']);
  const mainSummary = getFieldValue(attrs, ['field_body_content.summary', 'body.summary'])
    || mainBody.slice(0, 200);

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
    featured: attrs?.field_featured || false,
  };
}

export async function fetchDrupalPosts(limit = 6): Promise<DrupalPost[]> {
  const url = `${POSTS_ENDPOINT}?sort=-field_datum&include=field_cover&page[limit]=${limit}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Drupal API error: ${res.status}`);
    }
    const data = await res.json();
    const included = data?.included || [];
    return (data?.data || []).map((node: any) => mapNode(node, included));
  } catch (err) {
    console.error("[Drupal] Failed to fetch posts:", err);
    return [];
  }
}

export async function fetchDrupalPostBySlug(
  slug: string,
): Promise<DrupalPost | null> {
  const alias = `/blog/${slug}`;
  const url = `${POSTS_ENDPOINT}?filter[path.alias]=${encodeURIComponent(alias)}&include=field_cover`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Drupal API error: ${res.status}`);

    const data = await res.json();
    const node = data?.data?.[0];
    if (!node) return null;

    const included = data?.included || [];
    return mapNode(node, included);
  } catch (err) {
    console.error("[Drupal] Failed to fetch post by slug:", err);
    const posts = await fetchDrupalPosts(50);
    return posts.find((p) => p.slug === slug) || null;
  }
}
