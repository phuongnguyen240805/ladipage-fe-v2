import { http, HttpResponse } from "msw";
import {
  mockBillingUsage,
  mockBusinessReport,
  mockCustomersReport,
  mockDashboardSummary,
  mockOnboarding,
  mockPlans,
  mockSalesReport,
  mockWorkspace,
  resOp,
} from "./data";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:7002/api";

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export const handlers = [
  http.get(apiUrl("/dashboard/summary"), () =>
    HttpResponse.json(resOp(mockDashboardSummary))
  ),
  http.get(apiUrl("/dashboard/onboarding"), () =>
    HttpResponse.json(resOp(mockOnboarding))
  ),
  http.get(apiUrl("/plans"), () => HttpResponse.json(resOp(mockPlans))),
  http.get(apiUrl("/billing/usage"), () =>
    HttpResponse.json(resOp(mockBillingUsage))
  ),
  http.post(apiUrl("/billing/subscribe"), async () =>
    HttpResponse.json(
      resOp({
        session: { id: "cs_test_mock" },
        clientSecret: "cs_test_mock_secret",
      })
    )
  ),
  http.get(apiUrl("/billing/portal"), () =>
    HttpResponse.json(resOp({ portal: "https://billing.stripe.com/mock" }))
  ),
  http.post(apiUrl("/billing/cancel"), () =>
    HttpResponse.json(resOp(null))
  ),
  http.get(apiUrl("/ecom/orders"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: "DH1001",
            customerName: "Nguyễn Văn An",
            customerPhone: "0901234567",
            customerEmail: "an.nv@gmail.com",
            productName: "Serum TikTok Shop (x2)",
            quantity: 2,
            totalPrice: 700000,
            status: "PENDING",
            createdAt: new Date().toISOString(),
            orderId: 1,
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      })
    )
  ),
  http.post(apiUrl("/ecom/orders"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: "DH1002",
        customerName: body.customerName,
        customerPhone: body.customerPhone,
        customerEmail: body.customerEmail,
        productName: body.productName,
        quantity: body.quantity,
        totalPrice: body.totalPrice,
        status: "PENDING",
        createdAt: new Date().toISOString(),
        orderId: 2,
      })
    );
  }),
  http.patch(apiUrl("/ecom/orders/:id/status"), async ({ params, request }) => {
    const body = (await request.json()) as { status: string };
    return HttpResponse.json(
      resOp({
        id: params.id,
        status: body.status,
        orderId: Number(params.id),
      })
    );
  }),
  http.get(apiUrl("/crm/customers"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: "Nguyễn Thị Kim Ngân",
            phone: "0987654321",
            email: "ngan.ntk@gmail.com",
            status: "ACTIVE",
            createdAt: new Date().toISOString(),
            tags: ["VIP"],
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      })
    )
  ),
  http.get(apiUrl("/crm/segments"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: "New Subscribers",
            isDefault: true,
            customerCount: 8,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      })
    )
  ),
  http.post(apiUrl("/crm/customers"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: "mock-person-1",
        name: body.name,
        phone: body.phone,
        email: body.email ?? "",
        status: body.status ?? "ACTIVE",
        tags: [],
        createdAt: new Date().toISOString(),
      })
    );
  }),
  http.patch(apiUrl("/crm/customers/:id"), async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: params.id,
        name: body.name ?? "Customer",
        phone: body.phone ?? "",
        email: body.email ?? "",
        status: body.status ?? "ACTIVE",
        tags: [],
        createdAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/crm/customers/:id"), () => HttpResponse.json(resOp(null))),
  http.post(apiUrl("/crm/segments"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        name: body.name,
        isDefault: false,
        customerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/crm/segments/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/crm/tags"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: "VIP",
            count: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      })
    )
  ),
  http.post(apiUrl("/crm/tags"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        name: body.name,
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/crm/tags/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/crm/custom-fields"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: "cf-1",
            fieldName: "birthday",
            displayName: "Ngày sinh",
            dataType: "DATE",
            description: "Ngày sinh nhật",
          },
        ],
        meta: {
          itemCount: 1,
          totalItems: 1,
          itemsPerPage: 20,
          totalPages: 1,
          currentPage: 1,
        },
      })
    )
  ),
  http.post(apiUrl("/crm/custom-fields"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: "cf-2",
        fieldName: body.fieldName,
        displayName: body.displayName,
        dataType: body.dataType ?? "TEXT",
        description: body.description ?? "",
      })
    );
  }),
  http.delete(apiUrl("/crm/custom-fields/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/analytics/reports/sales"), () =>
    HttpResponse.json(resOp(mockSalesReport))
  ),
  http.get(apiUrl("/analytics/reports/business"), () =>
    HttpResponse.json(resOp(mockBusinessReport))
  ),
  http.get(apiUrl("/analytics/reports/customers"), () =>
    HttpResponse.json(resOp(mockCustomersReport))
  ),
  http.get(apiUrl("/settings/workspace"), () =>
    HttpResponse.json(resOp(mockWorkspace))
  ),
  http.get(apiUrl("/settings/integrations"), () =>
    HttpResponse.json(
      resOp({
        facebook: { configured: false },
        zalo: { configured: false },
      })
    )
  ),
  http.put(apiUrl("/settings/workspace"), async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(resOp(body));
  }),
  http.put(apiUrl("/settings/integrations"), async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(resOp(body));
  }),
  http.get(apiUrl("/ecom/tags"), ({ request }) => {
    const entity = new URL(request.url).searchParams.get("entity") ?? "order";
    return HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: entity === "order" ? "Ưu tiên" : "Bán chạy",
            color: entity === "order" ? "#38bdf8" : undefined,
            count: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 },
      })
    );
  }),
  http.post(apiUrl("/ecom/tags"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        name: body.name,
        color: body.color,
        count: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/ecom/tags/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/ecom/custom-fields"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            entityType: "order",
            fieldName: "ghi_chu",
            displayName: "Ghi chú",
            dataType: "TEXT",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 },
      })
    )
  ),
  http.post(apiUrl("/ecom/custom-fields"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/ecom/custom-fields/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/ecom/products"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: "Serum TikTok Shop",
            sku: "SP-001",
            price: 350000,
            stock: 10,
            status: "ACTIVE",
            type: "physical",
            typeName: "Sản phẩm vật lý",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 },
      })
    )
  ),
  http.post(apiUrl("/ecom/products"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/ecom/products/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/ecom/categories"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            name: "Mỹ phẩm",
            parentId: null,
            imageUrl: "",
            visible: true,
            productCount: 3,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 },
      })
    )
  ),
  http.post(apiUrl("/ecom/categories"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        productCount: 0,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.patch(apiUrl("/ecom/categories/:id"), async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json(resOp(body));
  }),
  http.delete(apiUrl("/ecom/categories/:id"), () => HttpResponse.json(resOp(null))),
  http.get(apiUrl("/ecom/reviews"), () =>
    HttpResponse.json(
      resOp({
        items: [
          {
            id: 1,
            productId: 1,
            productName: "Serum TikTok Shop",
            productNames: ["Serum TikTok Shop"],
            rating: 5,
            content: "Sản phẩm tuyệt vời",
            reviewerName: "Lan Anh",
            avatarUrl: "",
            imageUrls: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 20, totalPages: 1, currentPage: 1 },
      })
    )
  ),
  http.post(apiUrl("/ecom/reviews"), async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      resOp({
        id: 2,
        ...body,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    );
  }),
  http.delete(apiUrl("/ecom/reviews/:id"), () => HttpResponse.json(resOp(null))),
];