export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at?: string;
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  category_id: string | null;
  category?: Category | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at?: string;
  updated_at?: string;
};
