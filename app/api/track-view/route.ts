import { NextResponse } from "next/server";

function disabled() {
  return NextResponse.json(
    { ok: false, error: "track-view disabled" },
    { status: 404, headers: { "Cache-Control": "no-store" } }
  );
}

export async function GET() {
  return disabled();
}

export async function POST() {
  return disabled();
}
