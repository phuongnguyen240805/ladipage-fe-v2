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
};

export type ProductItem = {
  id: string;
  name: string;
  price: number;
  sku: string;
};
