import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Voeg hier eventuele middleware logica toe
  return NextResponse.next();
}
