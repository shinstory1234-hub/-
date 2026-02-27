import { mockPosts } from "@/lib/mock";

export async function getPosts() {
  return mockPosts;
}

export async function getPostBySlug(slug: string) {
  return mockPosts.find((p) => p.slug === slug) ?? null;
}

export async function getPostsByTopic(topic: string) {
  return mockPosts.filter((p) => p.category === topic || p.tags.includes(topic));
}
