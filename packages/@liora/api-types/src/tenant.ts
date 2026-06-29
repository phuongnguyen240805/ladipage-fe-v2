/** JWT / request tenant context shared between backend and frontend */
export interface TenantJwtContext {
  organizationId?: string;
  tenantId?: number;
  activeTenantId?: number;
}

/** Pagination meta from backend (nestjs-typeorm-paginate) */
export interface PaginationMeta {
  itemCount: number;
  totalItems?: number;
  itemsPerPage: number;
  totalPages?: number;
  currentPage: number;
}

/** Standard paginated list wrapper */
export interface PaginatedData<T> {
  items: T[];
  meta: PaginationMeta;
}