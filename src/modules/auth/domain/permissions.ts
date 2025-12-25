/**
 * RBAC Permissions Matrix
 * 
 * Defines what actions each role can perform on each resource.
 */

import type { UserRole } from '@prisma/client';

/**
 * Resource types in the system
 */
export type Resource =
  | 'products'
  | 'orders'
  | 'inventory'
  | 'blog'
  | 'users'
  | 'customers'
  | 'settings'
  | 'reports'
  | 'media'
  | 'contacts';

/**
 * Actions that can be performed
 */
export type Action = 'create' | 'read' | 'update' | 'delete' | 'list' | 'export' | 'manage';

/**
 * Permission string format: resource:action
 */
export type Permission = `${Resource}:${Action}`;

/**
 * Permissions matrix by role
 */
const PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    // Products
    'products:create',
    'products:read',
    'products:update',
    'products:delete',
    'products:list',
    'products:export',
    // Orders
    'orders:create',
    'orders:read',
    'orders:update',
    'orders:delete',
    'orders:list',
    'orders:export',
    'orders:manage',
    // Inventory
    'inventory:create',
    'inventory:read',
    'inventory:update',
    'inventory:delete',
    'inventory:list',
    'inventory:export',
    'inventory:manage',
    // Blog
    'blog:create',
    'blog:read',
    'blog:update',
    'blog:delete',
    'blog:list',
    'blog:manage',
    // Users
    'users:create',
    'users:read',
    'users:update',
    'users:delete',
    'users:list',
    'users:manage',
    // Customers
    'customers:read',
    'customers:update',
    'customers:list',
    'customers:export',
    // Settings
    'settings:read',
    'settings:update',
    'settings:manage',
    // Reports
    'reports:read',
    'reports:list',
    'reports:export',
    // Media
    'media:create',
    'media:read',
    'media:update',
    'media:delete',
    'media:list',
    // Contacts
    'contacts:read',
    'contacts:update',
    'contacts:delete',
    'contacts:list',
  ],

  EDITOR: [
    // Products
    'products:create',
    'products:read',
    'products:update',
    'products:list',
    // Orders (read only)
    'orders:read',
    'orders:list',
    // Blog
    'blog:create',
    'blog:read',
    'blog:update',
    'blog:list',
    // Media
    'media:create',
    'media:read',
    'media:update',
    'media:list',
    // Contacts (read only)
    'contacts:read',
    'contacts:list',
  ],

  CUSTOMER: [
    // Can only read products
    'products:read',
    'products:list',
    // Can view own orders
    'orders:read',
    'orders:list',
    // Can read blog
    'blog:read',
    'blog:list',
  ],
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Check if a role has any of the specified permissions
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a role has all of the specified permissions
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return PERMISSIONS[role] ?? [];
}

/**
 * Check if user can access a resource with specific action
 */
export function canAccess(role: UserRole, resource: Resource, action: Action): boolean {
  return hasPermission(role, `${resource}:${action}`);
}

