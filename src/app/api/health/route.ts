import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export async function GET() {
  const start = Date.now();
  let dbStatus = false;

  try {
    dbStatus = await testConnection();
  } catch {
    dbStatus = false;
  }

  const responseTime = Date.now() - start;

  const status = dbStatus ? 200 : 503;

  return NextResponse.json(
    {
      status: dbStatus ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: dbStatus ? "connected" : "unreachable",
      responseTimeMs: responseTime,
    },
    { status }
  );
}
