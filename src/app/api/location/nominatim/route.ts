import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy para Nominatim (OpenStreetMap) — exige User-Agent identificável.
 * Uso: busca de estado/cidade fora do Brasil.
 */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  const countrycodes = req.nextUrl.searchParams.get("countrycodes")?.trim() ?? "";

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "10");
  if (countrycodes.length === 2) {
    url.searchParams.set("countrycodes", countrycodes.toLowerCase());
  }

  try {
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "BDRAPP/1.0 (cadastro; contato via site)",
        Accept: "application/json",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json([]);
    }
    const data = await res.json();
    return NextResponse.json(Array.isArray(data) ? data : []);
  } catch {
    return NextResponse.json([]);
  }
}
