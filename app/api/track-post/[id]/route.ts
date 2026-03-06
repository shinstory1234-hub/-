import { POST as trackPostPost } from "@/app/api/track-post/route";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  return trackPostPost(new Request("http://localhost/api/track-post", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ postId: id })
  }));
}