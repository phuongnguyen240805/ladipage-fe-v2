export type OrderItem = {
  id: string;
  orderId?: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  status: "PENDING" | "SHIPPED" | "UNPAID" | "SPAM" | "COMPLETED";
  createdAt: string;
  salesChannel?: string;
  staff?: string;
};

export type ProductItem = {
  id: string | number;
  name: string;
  price: number;
  sku: string;
  stock?: number;
};
