import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Stuur altijd een succesvolle response terug
  return NextResponse.json({ received: true });
}
