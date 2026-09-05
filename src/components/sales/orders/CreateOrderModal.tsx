import React, { useEffect, useMemo, useRef, useState } from "react";
import { useCustomers } from "@/features/crm/hooks/useCustomers";
import { useOrderTags } from "@/features/ecom/hooks/useTags";
import {
  ecomApi,
  type CreateShipmentPayload,
  type ShippingIntegration,
  type ShippingProvider,
} from "@/lib/endpoints/ecom.api";
import { IconX, IconShoppingBag } from "../dung-chung/icons";
import { ProductItem } from "../dung-chung/types";

export type StaffOption = {
  id: string;
  name: string;
  role?: "owner" | "staff";
};

export type CreateOrderFormData = {
  customerId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: string;
  salesChannel: string;
  staff: string;
  staffId?: string | null;
  internalNote: string;
  tagIds?: number[];
  items: Array<{
    productId?: number;
    productName: string;
    quantity: number;
    unitPrice: number;
  }>;
  shipping?: CreateShipmentPayload;
};

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateOrder: (orderData: CreateOrderFormData) => void | Promise<void>;
  products?: ProductItem[];
  staffOptions?: StaffOption[];
  isSubmitting?: boolean;
  initialCustomer?: {
    id?: string;
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
}

const mockProducts: ProductItem[] = [
  { id: "p1", name: "Serum TikTok Shop Mỹ Phẩm", price: 350000, sku: "MIPHAM-SERUM" },
  { id: "p2", name: "Đồng hồ thông minh Smartwatch Pro", price: 1250000, sku: "TECH-SMARTWATCH" },
  { id: "p3", name: "Trà thảo mộc Linh Chi Đông Trùng", price: 180000, sku: "FOOD-TEA" },
];

export const CreateOrderModal: React.FC<CreateOrderModalProps> = ({
  isOpen,
  onClose,
  onCreateOrder,
  products,
  staffOptions,
  isSubmitting = false,
  initialCustomer,
}) => {
  const shipmentIdempotencyKey = useRef(crypto.randomUUID());
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialCustomer?.id ?? "");
  const [customerName, setCustomerName] = useState(initialCustomer?.name ?? "");
  const [customerPhone, setCustomerPhone] = useState(initialCustomer?.phone ?? "");
  const [customerEmail, setCustomerEmail] = useState(initialCustomer?.email ?? "");

  const [selectedProducts, setSelectedProducts] = useState<{ product: ProductItem; qty: number }[]>([]);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD (Thu hộ khi giao)");
  const [salesChannel, setSalesChannel] = useState("Landing Page");
  const [staff, setStaff] = useState("Chưa có người phụ trách");
  const [staffId, setStaffId] = useState<string | null>(null);
  const resolvedStaffOptions = staffOptions ?? [];
  const [internalNote, setInternalNote] = useState("");
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
  const [submitError, setSubmitError] = useState("");
  const [shippingEnabled, setShippingEnabled] = useState(false);
  const [shippingIntegrations, setShippingIntegrations] = useState<ShippingIntegration[]>([]);
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider>("ghn");
  const [shippingAddress, setShippingAddress] = useState(initialCustomer?.address ?? "");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [provinceId, setProvinceId] = useState<number | undefined>();
  const [districtId, setDistrictId] = useState<number | undefined>();
  const [wardCode, setWardCode] = useState<string | undefined>();
  const [wardId, setWardId] = useState<number | undefined>();
  const [provinces, setProvinces] = useState<Array<{ ProvinceID: number; ProvinceName: string }>>([]);
  const [districts, setDistricts] = useState<Array<{ DistrictID: number; DistrictName: string }>>([]);
  const [wards, setWards] = useState<Array<{ WardCode: string; WardName: string }>>([]);
  const [shippingServices, setShippingServices] = useState<Array<{ service_id: number; service_type_id: number; short_name: string }>>([]);
  const [serviceId, setServiceId] = useState<number | undefined>();
  const [serviceTypeId, setServiceTypeId] = useState<number | undefined>();
  const [serviceName, setServiceName] = useState("");
  const [serviceCode, setServiceCode] = useState("");
  const [parcelWeight, setParcelWeight] = useState(500);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingQuoteId, setShippingQuoteId] = useState<number | undefined>();
  const [shippingBusy, setShippingBusy] = useState(false);
  const [shippingError, setShippingError] = useState("");
  const productOptions = products ?? [];
  const { data: orderTagsData } = useOrderTags();
  const orderTags = orderTagsData?.items ?? [];
  const customersQuery = useCustomers({ pageSize: 100 });
  const crmCustomers = useMemo(
    () => customersQuery.data?.items ?? [],
    [customersQuery.data?.items]
  );

  useEffect(() => {
    if (!isOpen) return;
    void ecomApi.listShippingIntegrations().then((items) => {
      const available = items.filter((item) => item.configured && item.enabled && item.connectedAt);
      setShippingIntegrations(available);
      if (available.length) {
        const selected = available.find((item) => item.provider === shippingProvider) ?? available[0];
        setShippingProvider(selected.provider);
        setServiceCode(String(selected.settings.serviceCode ?? ""));
      }
    }).catch((error) => {
      setShippingError(error instanceof Error ? error.message : "Không tải được cấu hình vận chuyển.");
    });
  }, [isOpen, shippingProvider]);

  useEffect(() => {
    if (!isOpen || !shippingEnabled || !["ghn", "viettel_post"].includes(shippingProvider)) return;
    void ecomApi.shippingProvinces(shippingProvider)
      .then((result) => setProvinces(result.provinces ?? []))
      .catch((error) => setShippingError(error instanceof Error ? error.message : "Không tải được tỉnh/thành GHN."));
  }, [isOpen, shippingEnabled, shippingProvider]);

  const formatStaffLabel = (item: StaffOption) =>
    item.role === "owner" ? `${item.name} (Owner)` : item.name;

  useEffect(() => {
    if (!isOpen || staffId || resolvedStaffOptions.length === 0) return;
    const preferred = resolvedStaffOptions.find((item) => item.role === "owner")
      ?? resolvedStaffOptions[0];
    setStaff(preferred.name);
    setStaffId(preferred.id);
  }, [isOpen, resolvedStaffOptions, staffId]);

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId);
    if (!customerId) return;

    const customer = crmCustomers.find((item) => String(item.id) === customerId);
    if (!customer) return;

    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setCustomerEmail(customer.email);
  };

  if (!isOpen) return null;

  const handleAddProduct = (prod: ProductItem) => {
    setSelectedProducts(prev => {
      const exists = prev.find(item => item.product.id === prod.id);
      if (exists) {
        return prev.map(item => item.product.id === prod.id ? { ...item, qty: item.qty + 1 } : item);
      } else {
        return [...prev, { product: prod, qty: 1 }];
      }
    });
    setShowProductDropdown(false);
  };

  const handleRemoveProduct = (prodId: ProductItem["id"]) => {
    setSelectedProducts(prev => prev.filter(item => item.product.id !== prodId));
  };

  const handleQtyChange = (prodId: ProductItem["id"], val: number) => {
    if (val <= 0) {
      handleRemoveProduct(prodId);
    } else {
      setSelectedProducts(prev => prev.map(item => item.product.id === prodId ? { ...item, qty: val } : item));
    }
  };

  const getSubtotal = () => {
    return selectedProducts.reduce((sum, item) => sum + item.product.price * item.qty, 0);
  };

  const selectProvince = async (value: string) => {
    const id = Number(value) || undefined;
    const selected = provinces.find((item) => item.ProvinceID === id);
    setProvinceId(id);
    setProvince(selected?.ProvinceName ?? "");
    setDistrictId(undefined);
    setDistrict("");
    setWardCode(undefined);
    setWardId(undefined);
    setWard("");
    setDistricts([]);
    setWards([]);
    setShippingServices([]);
    setShippingFee(0);
    setShippingQuoteId(undefined);
    if (!id) return;
    setShippingError("");
    try {
      const result = await ecomApi.shippingDistricts(id, shippingProvider);
      setDistricts(result.districts ?? []);
    } catch (error) {
      setDistricts([]);
      setShippingError(error instanceof Error ? error.message : "Không tải được khu vực giao hàng.");
    }
  };

  const selectDistrict = async (value: string) => {
    const id = Number(value) || undefined;
    const selected = districts.find((item) => item.DistrictID === id);
    setDistrictId(id);
    setDistrict(selected?.DistrictName ?? "");
    setWardCode(undefined);
    setWardId(undefined);
    setWard("");
    setWards([]);
    setShippingFee(0);
    setShippingQuoteId(undefined);
    if (!id) return;
    setShippingError("");

    // Ward data must not be discarded when the carrier service lookup fails.
    // GHN can reject available-services when the configured pickup district is
    // invalid, while its ward catalog for the recipient district is still valid.
    try {
      const wardResult = await ecomApi.shippingWards(id, shippingProvider);
      setWards(wardResult.wards ?? []);
      if (!wardResult.wards?.length) {
        setShippingError("Đơn vị vận chuyển chưa có phường/xã hoạt động cho khu vực này.");
      }
    } catch (error) {
      setWards([]);
      setShippingError(error instanceof Error ? error.message : "Không tải được danh sách phường/xã.");
    }

    if (shippingProvider !== "ghn") {
      setShippingServices([]);
      return;
    }
    try {
      const serviceResult = await ecomApi.shippingServices(id);
      const services = serviceResult.services ?? [];
      setShippingServices(services);
      const firstService = services[0];
      setServiceId(firstService?.service_id);
      setServiceTypeId(firstService?.service_type_id);
      setServiceName(firstService?.short_name ?? "");
      if (!services.length) {
        setShippingError("GHN chưa hỗ trợ dịch vụ từ kho lấy hàng tới khu vực này.");
      }
    } catch (error) {
      setShippingServices([]);
      setServiceId(undefined);
      setServiceTypeId(undefined);
      setServiceName("");
      setShippingError(error instanceof Error
        ? `Đã tải phường/xã nhưng không tải được dịch vụ GHN: ${error.message}`
        : "Đã tải phường/xã nhưng không tải được dịch vụ GHN. Kiểm tra ID quận/huyện lấy hàng.");
    }
  };

  const calculateShippingFee = async () => {
    if (shippingProvider === "ghn" && !serviceId && !serviceTypeId) {
      setShippingError("GHN chưa có dịch vụ hợp lệ cho tuyến này. Hãy chọn lại quận/huyện hoặc kiểm tra cấu hình Shop ID.");
      return;
    }
    setShippingBusy(true);
    setShippingError("");
    try {
      const result = await ecomApi.quoteShipping({
        provider: shippingProvider,
        recipientName: customerName.trim(),
        recipientPhone: customerPhone.trim(),
        address: {
          address: shippingAddress.trim(),
          province,
          district,
          ward,
          provinceId,
          districtId,
          wardCode,
          wardId,
        },
        parcel: { weight: parcelWeight },
        serviceId,
        serviceTypeId,
        serviceCode: serviceCode || undefined,
        insuranceValue: getSubtotal(),
      });
      setShippingFee(result.total);
      setShippingQuoteId(result.quoteId);
    } catch (error) {
      setShippingError(error instanceof Error ? error.message : "Không tính được phí vận chuyển.");
    } finally {
      setShippingBusy(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || selectedProducts.length === 0) return;
    setSubmitError("");

    try {
      await onCreateOrder({
        customerId: selectedCustomerId || undefined,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        paymentMethod,
        salesChannel,
        staff,
        staffId,
        internalNote: internalNote.trim(),
        tagIds: selectedTagIds.length ? selectedTagIds : undefined,
        items: selectedProducts.map((item) => {
          const numericProductId = Number(item.product.id);
          return {
            productId: Number.isFinite(numericProductId) ? numericProductId : undefined,
            productName: item.product.name,
            quantity: item.qty,
            unitPrice: item.product.price,
          };
        }),
        ...(shippingEnabled ? {
          shipping: {
            quoteId: shippingQuoteId,
            idempotencyKey: shipmentIdempotencyKey.current,
            provider: shippingProvider,
            recipientName: customerName.trim(),
            recipientPhone: customerPhone.trim(),
            address: {
              address: shippingAddress.trim(),
              province,
              district,
              ward,
              provinceId,
              districtId,
              wardCode,
              wardId,
            },
            parcel: { weight: parcelWeight },
            serviceId,
            serviceTypeId,
            serviceCode: serviceCode || undefined,
            serviceName: serviceName || undefined,
            fee: shippingFee,
            codAmount: getSubtotal() + shippingFee,
            note: internalNote.trim() || undefined,
          },
        } : {}),
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Không tạo được đơn hàng.");
      return;
    }

    // Reset fields
    setSelectedCustomerId("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setSelectedProducts([]);
    setSalesChannel("Landing Page");
    setStaff("Chưa có người phụ trách");
    setStaffId(null);
    setInternalNote("");
    setSelectedTagIds([]);
    setShippingEnabled(false);
    setShippingFee(0);
    setShippingQuoteId(undefined);
    onClose();
  };

  const toggleOrderTag = (tagId: number) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  return (
    <div className="fixed inset-0 z-999999 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-theme-xl max-w-5xl w-full h-[90vh] flex flex-col justify-between overflow-hidden animate-scale-up my-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-150 dark:border-gray-850 p-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
              Tạo đơn hàng mới
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
              Nhập thông tin khách hàng, chọn sản phẩm và xác nhận để tạo đơn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
          >
            <IconX size={20} />
          </button>
        </div>

        {/* Modal Scrollable Body - 2 Columns grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-gray-950/40 grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN: Products & Payment (Span 7) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Products in Order */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                  Sản phẩm trong đơn
                </h4>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="text-xs font-bold text-lime-500 dark:text-lime-300 hover:underline cursor-pointer"
                  >
                    Chọn sản phẩm và điều chỉnh số lượng/giá
                  </button>
                  {showProductDropdown && (
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1.5 z-50 animate-fade-in max-h-48 overflow-y-auto">
                      {productOptions.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleAddProduct(p)}
                          className="w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-gray-700 text-slate-800 dark:text-gray-200 transition cursor-pointer flex justify-between"
                        >
                          <span>{p.name}</span>
                          <span className="text-slate-450">{p.price.toLocaleString()}đ</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {selectedProducts.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 space-y-3">
                  {selectedProducts.map((item) => (
                    <div key={item.product.id} className="flex items-center justify-between pt-3 first:pt-0">
                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-slate-800 dark:text-gray-200 block max-w-xs truncate">
                          {item.product.name}
                        </span>
                        <span className="text-ui-micro text-slate-400 dark:text-slate-500 font-bold block uppercase">
                          SKU: {item.product.sku}
                        </span>
                        <span className="text-ui-micro text-slate-400 dark:text-slate-500 font-semibold block">
                          Đơn giá: {item.product.price.toLocaleString()}đ
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-250 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.product.id, item.qty - 1)}
                            className="px-2 py-1 text-slate-550 dark:text-slate-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800 dark:text-gray-200">
                            {item.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.product.id, item.qty + 1)}
                            className="px-2 py-1 text-slate-550 dark:text-slate-400 font-bold hover:bg-gray-50 dark:hover:bg-gray-850 cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-gray-200 w-24 text-right">
                          {(item.product.price * item.qty).toLocaleString()}đ
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(item.product.id)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        >
                          <IconX size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Empty products */
                <div className="py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl flex flex-col items-center justify-center space-y-3 select-none">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-gray-850 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <IconShoppingBag size={22} />
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                    Chưa có sản phẩm nào trong đơn
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowProductDropdown(!showProductDropdown)}
                    className="px-4 py-1.5 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition cursor-pointer"
                  >
                    + Thêm sản phẩm
                  </button>
                </div>
              )}
            </div>

            {/* Total Calculation breakdown */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider pb-1.5 border-b border-gray-100 dark:border-gray-800">
                Tổng tiền
              </h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                  <span>Tạm tính</span>
                  <span className="font-bold text-slate-800 dark:text-gray-200">{getSubtotal().toLocaleString()}đ</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Mã khuyến mãi</span>
                  <button type="button" className="text-lime-500 dark:text-lime-300 font-bold hover:underline cursor-pointer">
                    + Áp dụng mã
                  </button>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Giảm giá</span>
                  <button type="button" className="text-lime-500 dark:text-lime-300 font-bold hover:underline cursor-pointer">
                    + Thêm giảm giá
                  </button>
                </div>
                <div className="flex justify-between font-medium text-slate-500 dark:text-slate-400">
                  <span>Phí vận chuyển</span>
                  <span className="text-success-650 dark:text-success-400 font-bold">
                    {shippingEnabled ? `${shippingFee.toLocaleString("vi-VN")}đ` : "Chưa áp dụng"}
                  </span>
                </div>
                <div className="pt-3.5 border-t border-gray-100 dark:border-gray-800 flex justify-between text-sm font-bold text-slate-800 dark:text-white">
                  <span>Tổng tiền</span>
                  <span className="text-lime-500 dark:text-lime-300 text-base">
                    {(getSubtotal() + (shippingEnabled ? shippingFee : 0)).toLocaleString("vi-VN")}đ
                  </span>
                </div>
              </div>
            </div>

            {/* Staff Assignment */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Nhân viên phụ trách
              </h4>
              <div className="relative">
                <select
                  value={staffId ?? ""}
                  onChange={(e) => {
                    const nextId = e.target.value;
                    if (!nextId) {
                      setStaff("Chưa có người phụ trách");
                      setStaffId(null);
                      return;
                    }
                    const selected = resolvedStaffOptions.find((item) => item.id === nextId);
                    setStaff(selected?.name ?? "Chưa có người phụ trách");
                    setStaffId(nextId);
                  }}
                  className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-850 rounded-lg px-4 py-2.5 pr-8 text-xs font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
                >
                  <option value="">Chưa có người phụ trách</option>
                  {resolvedStaffOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {formatStaffLabel(item)}
                    </option>
                  ))}
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Internal Notes */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Ghi chú nội bộ
              </h4>
              <textarea
                placeholder="Nhập ghi chú chỉ nhân viên xem được..."
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="w-full min-h-[80px] p-3 text-xs rounded-lg border border-gray-250 dark:border-gray-850 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 placeholder-slate-405 focus:outline-hidden focus:border-lime-400"
              />
            </div>

            {orderTags.length > 0 && (
              <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                  Tag đơn hàng
                </h4>
                <div className="flex flex-wrap gap-2">
                  {orderTags.map((tag) => {
                    const tagId = Number(tag.id);
                    const selected = selectedTagIds.includes(tagId);
                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => toggleOrderTag(tagId)}
                        className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                          selected
                            ? "border-lime-500 bg-lime-50 text-lime-700 dark:bg-lime-950/30 dark:text-lime-300"
                            : "border-gray-200 text-slate-600 dark:border-gray-700 dark:text-slate-400"
                        }`}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Customer details & Metadata (Span 5) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Customer Details Form */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Thông tin khách hàng
              </h4>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Chọn khách hàng
                  </label>
                  <div className="relative">
                    <select
                      value={selectedCustomerId}
                      onChange={(e) => handleCustomerSelect(e.target.value)}
                      disabled={customersQuery.isLoading}
                      className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-850 rounded-lg px-3 py-2 pr-8 text-xs font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer disabled:opacity-60"
                    >
                      <option value="">
                        {customersQuery.isLoading
                          ? "Đang tải khách hàng..."
                          : "Chọn khách hàng từ CRM"}
                      </option>
                      {crmCustomers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                          {customer.phone ? ` — ${customer.phone}` : ""}
                        </option>
                      ))}
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Họ và tên
                  </label>
                  <input
                    type="text"
                    placeholder="Họ tên khách hàng..."
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-hidden focus:border-lime-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    placeholder="Số điện thoại liên hệ..."
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-hidden focus:border-lime-400"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Email (không bắt buộc)..."
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-250 dark:border-gray-800 bg-white dark:bg-gray-900 text-slate-800 dark:text-gray-100 focus:outline-hidden focus:border-lime-400"
                  />
                </div>
              </div>
            </div>

            {/* Sales Channel & Payment Method */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Nguồn & thanh toán
              </h4>
              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Kênh bán hàng
                  </label>
                  <div className="relative">
                    <select
                      value={salesChannel}
                      onChange={(e) => setSalesChannel(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-850 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
                    >
                      <option value="Landing Page">Landing Page</option>
                      <option value="Website">Website</option>
                      <option value="Facebook Ads">Facebook Ads</option>
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-ui-micro font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
                    Phương thức thanh toán
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full appearance-none bg-white dark:bg-gray-900 border border-gray-250 dark:border-gray-855 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-350 focus:outline-hidden focus:border-lime-400 cursor-pointer"
                    >
                      <option value="COD (Thu hộ khi giao)">COD (Thu hộ khi giao)</option>
                      <option value="Chuyển khoản ngân hàng">Chuyển khoản ngân hàng</option>
                    </select>
                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">Vận chuyển</h4>
                  <p className="mt-1 text-ui-micro text-slate-400">Tính phí và tạo vận đơn ngay sau khi tạo đơn LadiPage.</p>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <input type="checkbox" checked={shippingEnabled} onChange={(event) => { setShippingEnabled(event.target.checked); setShippingError(""); }} className="h-4 w-4 accent-lime-500" />
                  Giao hàng
                </label>
              </div>

              {shippingEnabled ? (
                shippingIntegrations.length ? (
                  <div className="space-y-3">
                    <label className="block space-y-1">
                      <span className="text-ui-micro font-bold uppercase tracking-wider text-slate-450">Đơn vị vận chuyển</span>
                      <select value={shippingProvider} onChange={(event) => { const provider = event.target.value as ShippingProvider; setShippingProvider(provider); setServiceCode(String(shippingIntegrations.find((item) => item.provider === provider)?.settings.serviceCode ?? "")); setShippingFee(0); setShippingQuoteId(undefined); setShippingError(""); }} className="w-full rounded-lg border border-gray-250 bg-white px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
                        {shippingIntegrations.map((item) => <option key={item.provider} value={item.provider}>{item.name}</option>)}
                      </select>
                    </label>

                    <label className="block space-y-1">
                      <span className="text-ui-micro font-bold uppercase tracking-wider text-slate-450">Địa chỉ giao hàng</span>
                      <input value={shippingAddress} onChange={(event) => { setShippingAddress(event.target.value); setShippingFee(0); setShippingQuoteId(undefined); }} placeholder="Số nhà, tên đường..." className="w-full rounded-lg border border-gray-250 bg-white px-3 py-2 text-xs dark:border-gray-800 dark:bg-gray-900" />
                    </label>

                    {["ghn", "viettel_post"].includes(shippingProvider) ? (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <select value={provinceId ?? ""} onChange={(event) => void selectProvince(event.target.value)} className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
                          <option value="">Tỉnh/thành</option>
                          {provinces.map((item) => <option key={item.ProvinceID} value={item.ProvinceID}>{item.ProvinceName}</option>)}
                        </select>
                        <select value={districtId ?? ""} onChange={(event) => void selectDistrict(event.target.value)} disabled={!provinceId} className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900">
                          <option value="">Quận/huyện</option>
                          {districts.map((item) => <option key={item.DistrictID} value={item.DistrictID}>{item.DistrictName}</option>)}
                        </select>
                        <select value={wardCode ?? ""} onChange={(event) => { const code = event.target.value || undefined; setWardCode(code); setWardId(shippingProvider === "viettel_post" ? Number(code) || undefined : undefined); setWard(wards.find((item) => item.WardCode === code)?.WardName ?? ""); setShippingFee(0); setShippingQuoteId(undefined); }} disabled={!districtId} className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs disabled:opacity-50 dark:border-gray-800 dark:bg-gray-900">
                          <option value="">Phường/xã sau sáp nhập</option>
                          {wards.map((item) => <option key={item.WardCode} value={item.WardCode}>{item.WardName}</option>)}
                        </select>
                      </div>
                    ) : (
                      <div className="grid gap-2 sm:grid-cols-3">
                        <input value={province} onChange={(event) => { setProvince(event.target.value); setShippingFee(0); setShippingQuoteId(undefined); }} placeholder="Tỉnh/thành" className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900" />
                        <input value={district} onChange={(event) => { setDistrict(event.target.value); setShippingFee(0); setShippingQuoteId(undefined); }} placeholder="Quận/huyện" className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900" />
                        <input value={ward} onChange={(event) => { setWard(event.target.value); setShippingFee(0); setShippingQuoteId(undefined); }} placeholder="Phường/xã" className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900" />
                      </div>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2">
                      {shippingProvider === "ghn" ? (
                        <select value={serviceId ?? ""} onChange={(event) => { const id = Number(event.target.value) || undefined; const selected = shippingServices.find((item) => item.service_id === id); setServiceId(id); setServiceTypeId(selected?.service_type_id); setServiceName(selected?.short_name ?? ""); setShippingFee(0); setShippingQuoteId(undefined); }} className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900">
                          <option value="">Dịch vụ GHN</option>
                          {shippingServices.map((item) => <option key={`${item.service_id}:${item.service_type_id}`} value={item.service_id}>{item.short_name}</option>)}
                        </select>
                      ) : shippingProvider === "ghtk" ? <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:bg-white/5">GHTK đường bộ</div> : (
                        <input value={serviceCode} onChange={(event) => { setServiceCode(event.target.value); setShippingFee(0); setShippingQuoteId(undefined); }} placeholder="Mã dịch vụ vận chuyển" className="rounded-lg border border-gray-250 bg-white px-2 py-2 text-xs dark:border-gray-800 dark:bg-gray-900" />
                      )}
                      <label className="flex items-center gap-2 rounded-lg border border-gray-250 px-3 py-2 text-xs dark:border-gray-800">
                        <span className="text-slate-400">Khối lượng</span>
                        <input type="number" min={1} value={parcelWeight} onChange={(event) => { setParcelWeight(Math.max(1, Number(event.target.value))); setShippingFee(0); setShippingQuoteId(undefined); }} className="min-w-0 flex-1 bg-transparent text-right outline-none" />
                        <span>g</span>
                      </label>
                    </div>

                    <button type="button" disabled={shippingBusy || !shippingAddress.trim() || !province || !district || !ward || (["ghn", "viettel_post"].includes(shippingProvider) && (!districtId || !wardCode)) || (shippingProvider === "ghn" && !serviceId && !serviceTypeId)} onClick={() => void calculateShippingFee()} className="h-9 w-full rounded-lg border border-lime-500 text-xs font-bold text-lime-700 transition hover:bg-lime-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-lime-300 dark:hover:bg-lime-500/10">
                      {shippingBusy ? "Đang tính phí..." : shippingFee > 0 ? `Phí dự kiến: ${shippingFee.toLocaleString("vi-VN")}đ — Tính lại` : "Tính phí vận chuyển"}
                    </button>
                    {shippingError ? <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-ui-caption text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">{shippingError}</div> : null}
                  </div>
                ) : (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
                    Chưa có đơn vị vận chuyển đã xác minh. Vào CSKH → Cài đặt → Vận chuyển để cấu hình và kiểm tra kết nối.
                  </div>
                )
              ) : null}
            </div>

            {/* Labels/Tags */}
            <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-gray-200 uppercase tracking-wider">
                Nhãn
              </h4>
              <button
                type="button"
                className="w-full py-2 border border-gray-200 dark:border-gray-800 hover:bg-slate-50 dark:hover:bg-gray-850 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>+ Thêm nhãn</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-150 dark:border-gray-850 p-5 flex justify-end gap-3 bg-gray-50/50 dark:bg-gray-900/10 select-none">
          <button
            type="button"
            onClick={onClose}
            className="px-4.5 py-2 text-sm font-semibold text-slate-650 hover:bg-gray-100 rounded-lg dark:text-slate-300 dark:hover:bg-white/5 cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedProducts.length === 0 || !customerName.trim() || !customerPhone.trim() || (shippingEnabled && (!shippingIntegrations.length || !shippingAddress.trim() || !province || !district || !ward || !shippingQuoteId))}
            className={`px-5 py-2 text-sm font-semibold text-white rounded-lg shadow-sm transition ${
              isSubmitting || selectedProducts.length === 0 || !customerName.trim() || !customerPhone.trim() || (shippingEnabled && (!shippingIntegrations.length || !shippingAddress.trim() || !province || !district || !ward || !shippingQuoteId))
                ? "bg-lime-300 opacity-50 cursor-not-allowed"
                : "bg-lime-500 hover:bg-lime-600 cursor-pointer"
            }`}
          >
            {isSubmitting ? "Đang tạo..." : "Tạo đơn"}
          </button>
        </div>
        {submitError && (
          <div className="px-5 pb-4 text-xs font-semibold text-red-600 dark:text-red-300">
            {submitError}
          </div>
        )}
      </div>
    </div>
  );
};
