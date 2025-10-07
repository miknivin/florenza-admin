import { NextResponse } from "next/server";
import dbConnect from "@/lib/db/connection";
export async function POST(req) {
  // Validate method (only POST allowed per Delhivery’s requirement)
  if (req.method !== "POST") {
    return NextResponse.json(
      { message: "Method Not Allowed" },
      { status: 405 },
    );
  }

  // Validate authorization header
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.DELHIVERY_API_TOKEN; // Set in .env (dev or prod token)
  if (authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Connect to MongoDB
    await dbConnect();

    const payload = await req.json();
    const { Shipment } = payload;
    const { AWB, Status, PickUpDate, NSLCode, Sortcode, ReferenceNo } =
      Shipment;

    // Prepare status update for orderTracking
    const statusUpdate = {
      Status: Status.Status,
      StatusDateTime: new Date(Status.StatusDateTime),
      StatusType: Status.StatusType,
      StatusLocation: Status.StatusLocation,
      Instructions: Status.Instructions || "",
    };

    // Update the Order document
    const updateData = {
      $push: {
        orderTracking: {
          $each: [statusUpdate],
          $sort: { StatusDateTime: -1 }, // Sort latest first in the array
        },
      },
      $set: {
        waybill: AWB,
        ...(Status.Status === "Delivered" && {
          deliveredAt: new Date(Status.StatusDateTime),
        }),
        // Set initial shipment details if not already set
        ...(PickUpDate && { "shippingInfo.PickUpDate": PickUpDate }),
        ...(NSLCode && { "shippingInfo.NSLCode": NSLCode }),
        ...(Sortcode && { "shippingInfo.Sortcode": Sortcode }),
        ...(ReferenceNo && { "shippingInfo.ReferenceNo": ReferenceNo }),
      },
    };

    // Find and update the order by AWB
    await Order.findOneAndUpdate({ waybill: AWB }, updateData, {
      upsert: true,
      new: true,
    });

    // Respond within 500ms
    return NextResponse.json({ message: "OK" }, { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    if (error.code === 11000) {
      // Handle duplicate waybill error
      return NextResponse.json(
        { message: "Duplicate waybill detected" },
        { status: 400 },
      );
    }
    return NextResponse.json({ message: "Server Error" }, { status: 500 });
  }
}
