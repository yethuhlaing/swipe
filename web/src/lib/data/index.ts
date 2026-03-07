/**
 * Data Access Layer
 *
 * Centralized data access functions for all domain entities.
 * Use these instead of direct db queries for:
 * - Consistent multi-tenancy enforcement
 * - Reusable query patterns
 * - Type-safe operations
 * - Business logic encapsulation
 */

export * from "./tenants"
export * from "./buyers"
export * from "./conversations"
export * from "./orders"
// export * from "./catalog"
export * from "./analytics"
