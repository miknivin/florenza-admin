"use client";

import { useGetAdminOrdersQuery } from "@/redux/api/orderApi";
import { Order } from "@/types/order";
import Link from "next/link";
import Spinner from "../common/Spinner";
import { useEffect, useState } from "react";
import axios from "axios";

type OrderTableProps = {
  limit: number | null;
};

async function trackDelhiveryShipment(
  waybill: any,
  refIds: any = "ORD1243244",
): Promise<any> {
  // Call your backend API route instead of Delhivery directly
  try {
    const response = await axios.get("/api/delhivery-status", {
      params: {
        waybill,
        ref_ids: refIds,
      },
    });
    return response.data;
  } catch (error: any) {
    throw new Error(`Failed to track shipment: ${error.message}`);
  }
}

const DashboardOrderTable = ({ limit }: OrderTableProps) => {
  const { data, isLoading, isError } = useGetAdminOrdersQuery(null);
  const [orderStatuses, setOrderStatuses] = useState<{ [key: string]: string }>(
    {},
  );

  // Fetch and update statuses for all orders
  useEffect(() => {
    const fetchAndUpdateStatus = async () => {
      if (!data?.orders || data.orders.length === 0) return;

      const statusPromises = data.orders.map(async (order: Order) => {
        if (!order.waybill) {
          return { orderId: order._id, status: order.orderStatus, error: true };
        }
        try {
          const trackResult = await trackDelhiveryShipment(order.waybill);
          const shipmentStatus =
            trackResult?.ShipmentData?.[0]?.Shipment?.Status?.Status ||
            order.orderStatus;
          return { orderId: order._id, status: shipmentStatus, error: false };
        } catch (error) {
          return { orderId: order._id, status: order.orderStatus, error: true };
        }
      });

      try {
        const results = await Promise.all(statusPromises);
        const newStatuses = results.reduce(
          (acc: { [key: string]: string }, result) => {
            acc[result.orderId] = result.status;
            return acc;
          },
          {},
        );
        setOrderStatuses(newStatuses);
      } catch (error) {
        console.error("Error fetching statuses:", error);
      }
    };

    fetchAndUpdateStatus();
  }, [data?.orders]);

  if (isLoading) {
    return (
      <p>
        <Spinner />
      </p>
    );
  }

  if (isError) {
    return <p>Error loading orders.</p>;
  }

  const displayLimit = limit !== null ? limit : data.orders?.length;

  if (!data?.orders || data.orders.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>
        <p className="text-center text-gray-500 dark:text-gray-400">
          No orders found.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Latest Orders
        </h4>
        <Link href={"/orders"} className="btn-soft btn me-3">
          View orders
        </Link>
      </div>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
        <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400 rtl:text-right">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Order ID
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Customer
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Total
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-center">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {data.orders?.slice(0, displayLimit).map((order: Order) => (
              <tr
                key={order._id}
                className="border-b border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600"
              >
                <th
                  scope="row"
                  className="whitespace-nowrap px-6 py-4 font-medium text-gray-900 dark:text-white"
                >
                  {order._id.slice(-6)}
                </th>
                <td className="px-6 py-4 text-center">
                  {order.shippingInfo.fullName}
                </td>
                <td className="px-6 py-4 text-center">₹{order.totalAmount}</td>
                <td className="px-6 py-4 text-center">
                  {orderStatuses[order._id] || order.orderStatus}
                </td>
                <td className="px-6 py-4 text-center">
                  {new Date(order.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4 text-center">
                  <Link href={`/orderDetails/${order._id}`} className="btn">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardOrderTable;
