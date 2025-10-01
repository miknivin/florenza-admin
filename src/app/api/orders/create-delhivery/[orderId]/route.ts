import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { isAuthenticatedUser } from "@/middlewares/auth"; // Your authentication function
import { authorizeRoles } from "@/middlewares/auth"; // Your authorization function
import dbConnect from "@/lib/db/connection";
import Order from "@/models/Order";
import { createDelhiveryShipment } from "@/utlis/createDelhiveryShipment";

// Environment variable for Delhivery API token
const DELHIVERY_API_TOKEN = process.env.DELHIVERY_API_TOKEN;

export async function POST(
  request: Request,
  { params }: { params: { orderId: string } },
) {
  try {
    // Connect to MongoDB
    await dbConnect();

    // Authenticate user and check for admin role
    const user = await isAuthenticatedUser(request);
    authorizeRoles(user, "admin");

    const { orderId } = params;

    if (!orderId || !mongoose.isValidObjectId(orderId)) {
      return NextResponse.json(
        { success: false, message: "Invalid order ID" },
        { status: 400 },
      );
    }

    // Fetch order from database
    const order = await Order.findById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: "Order not found" },
        { status: 404 },
      );
    }

    // Check if order already has a waybill
    if (order.waybill) {
      return NextResponse.json(
        { success: false, message: "Order already has a waybill" },
        { status: 400 },
      );
    }

    // Calculate total quantity for weight (assuming ~300g per perfume bottle, including packaging)
    const totalQuantity = order.orderItems.reduce(
      (total: number, item: any) => total + item.quantity,
      0,
    );
    const weight = totalQuantity * 300; // 300g per bottle, adjust as needed

    // Prepare Delhivery shipment data (adapted from your order creation code)
    const shipmentData = {
      shipments: [
        {
          name: order.shippingInfo.fullName || "Customer",
          add: order.shippingInfo.address,
          pin: order.shippingInfo.zipCode,
          city: order.shippingInfo.city,
          state: order.shippingInfo.state || "Unknown",
          country: order.shippingInfo.country || "India",
          phone: order.shippingInfo.phoneNo,
          order: order._id.toString(),
          payment_mode: order.paymentMethod === "COD" ? "COD" : "Prepaid",
          return_pin: "678583", // Fixed return address from your code
          return_city: "Thachanattukara",
          return_phone: "9778766273",
          return_add:
            "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway",
          return_state: "Kerala",
          return_country: "India",
          products_desc: order.orderItems
            .map((item: any) => item.name)
            .join(", "), // Combine perfume names
          hsn_code: "3303", // HSN code for perfumes
          cod_amount:
            order.paymentMethod === "COD" ? order.totalAmount.toString() : "0",
          order_date: new Date(order.createdAt).toISOString().split("T")[0], // Order creation date in YYYY-MM-DD
          total_amount: order.totalAmount.toString(),
          seller_add:
            "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway", // Fixed seller address from your code
          seller_name: "Florenza Italiya", // Fixed seller name
          seller_inv: `INV${order._id.toString()}`, // Unique invoice based on order ID
          quantity: totalQuantity.toString(),
          waybill: "", // Delhivery will assign
          shipment_width: "100", // 10 cm, typical for a small perfume box (in mm? adjust if needed)
          shipment_height: "150", // 15 cm, typical for a small perfume box (in mm? adjust if needed)
          shipment_length: "100", // Added length for completeness (adjust as needed)
          weight: weight.toString(), // Total weight in grams
          shipping_mode: "Surface", // Default as per your code
          address_type: "home", // Default as per your code
        },
      ],
      pickup_location: {
        name: "Florenza Italiya", // Fixed pickup name from your code
        add: "Florenza Italiya Near ABS Traders Kodakkad, Opp: Rifa Medical Center Kodakkad-Palakkad Kozhikode Highway",
        pin: "678583",
        city: "Thachanattukara",
        state: "Kerala",
        country: "India",
        phone: "9778766273",
      },
    };

    // Call Delhivery API to create shipment
    if (!DELHIVERY_API_TOKEN) {
      return NextResponse.json(
        { success: false, message: "Delhivery API token not configured" },
        { status: 500 },
      );
    }

    const delhiveryResponse = await createDelhiveryShipment(
      DELHIVERY_API_TOKEN,
      shipmentData,
    );

    // Extract waybill from response
    const waybill = delhiveryResponse.packages?.[0]?.waybill;
    if (!waybill) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to retrieve waybill from Delhivery",
        },
        { status: 500 },
      );
    }

    // Update order with waybill and status
    await Order.findByIdAndUpdate(orderId, {
      waybill,
      orderStatus: "Shipped",
    });

    return NextResponse.json({
      success: true,
      message: "Delhivery order created successfully",
      waybill,
    });
  } catch (error: any) {
    console.error("Error creating Delhivery order:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to create Delhivery order",
      },
      { status: 500 },
    );
  }
}
