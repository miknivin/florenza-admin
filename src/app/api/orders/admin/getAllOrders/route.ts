import { NextResponse, NextRequest } from "next/server"; // Import NextRequest here

import { authorizeRoles, isAuthenticatedUser } from "@/middlewares/auth";
import dbConnect from "@/lib/db/connection";
import { OrderFilter } from "@/utlis/OrderFilter";

export async function GET(req: NextRequest) {
  // Changed parameter type to NextRequest
  try {
    await dbConnect();

    // Authenticate the user
    const user = await isAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Need to login" },
        { status: 400 },
      );
    }

    authorizeRoles(user, "admin");

    // Extract filter options from request
    const filterOptions = OrderFilter.extractFilterOptions(req);

    // Apply filters and get orders
    const orderFilter = new OrderFilter(filterOptions);
    const orders = await orderFilter.getFilteredOrders();

    if (!orders || orders.length === 0) {
      // Simplified check
      return NextResponse.json(
        { success: true, orders: [], message: "No orders found" }, // Return empty array for consistency
        { status: 200 },
      );
    }

    return NextResponse.json({ success: true, orders }, { status: 200 });
  } catch (error:any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }
}
