import { Types } from "mongoose";

export interface ShippingInfo {
  fullName?: string;
  address: string;
  email?: string;
  state?: string;
  city: string;
  phoneNo: string;
  zipCode: string;
  country: string; // default: "India"
}

export interface OrderItem {
  name: string;
  sku?: string;
  quantity: number;
  image: string;
  variant: string;
  price: string; // Schema uses String, not Number
  product: string | Types.ObjectId; // ref: "products"
}

export interface PaymentInfo {
  id?: string;
  status?: string;
}

export interface OrderTracking {
  Status?: string;
  StatusDateTime?: Date;
  StatusType?: string;
  StatusLocation?: string;
  Instructions?: string;
}

export interface Order {
  _id: string;
  shippingInfo: ShippingInfo;
  user: Types.ObjectId | string;
  orderItems: OrderItem[];
  paymentMethod: "COD" | "Online";
  paymentInfo?: PaymentInfo;
  itemsPrice: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  couponApplied?: string; // default: "No"
  orderStatus: "Processing" | "Shipped" | "Delivered";
  orderNotes?: string;
  waybill?: string;
  invoiceURL?: string;
  delhiveryCurrentOrderStatus?: string; // New field for Delhivery status
  orderTracking?: OrderTracking[]; // New field for tracking details
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}
