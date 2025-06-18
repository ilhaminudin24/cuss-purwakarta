import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const query = searchParams.get("q");
  // viewbox is now optional and not used

  if (!query) {
    return NextResponse.json({ error: "Missing query parameter" }, { status: 400 });
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${query}&countrycodes=id&limit=5`,
    {
      headers: {
        "Accept-Language": "id",
      },
    }
  );
  const data = await response.json();
  return NextResponse.json(data);
} 