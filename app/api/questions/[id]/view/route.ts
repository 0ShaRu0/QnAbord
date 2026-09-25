import { incrementViews } from "@/lib/queries/questions";
import { isUuid } from "@/lib/validation/questions";
import { reportError } from "@/lib/errors";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) return new Response(null, { status: 403 });
  const { id } = await params;
  if (!isUuid(id)) return new Response(null, { status: 400 });
  try {
    if (!(await incrementViews(id))) return new Response(null, { status: 503 });
  } catch (error) {
    reportError("questions.trackView", error, id);
    return new Response(null, { status: 503 });
  }
  return new Response(null, { status: 204 });
}
