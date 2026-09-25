import { NextResponse } from "next/server";

// Keep legacy browser requests working; the metadata icon is app/icon.svg.
export function GET(request: Request) {
  return NextResponse.redirect(new URL("/icon.svg", request.url), 308);
}
