import { NextRequest, NextResponse } from "next/server";
import { syncDelhiveryOrders } from "@/utlis/syncDelhiveryOrders";
import dbConnect from "@/lib/db/connection";

const CRON_SECRET = process.env.CRON_SECRET;

export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing token" },
      { status: 401 },
    );
  }

  await dbConnect();

  try {
    const { waybill } = await req.json();
    const result = await syncDelhiveryOrders(waybill);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Manual sync error:", error);
    return NextResponse.json(
      { error: "Failed to sync orders" },
      { status: 500 },
    );
  }
}
