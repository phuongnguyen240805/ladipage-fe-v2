/** Maps OrdersList tab filter to BE listOrders `status` query param. */
export function mapOrderStatusFilterToApi(
  filter: string
): string | undefined {
  if (filter === "ALL" || filter === "NOT_DELIVERED") return undefined;
  return filter;
}