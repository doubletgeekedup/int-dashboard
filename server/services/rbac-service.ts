import { storage } from '../storage';
import { nanoid } from 'nanoid';
import type { User, Role, Permission, UserRole, InsertRole, InsertUserRole, InsertPermission } from '@shared/schema';

export class RBACService {
  // Initialize default roles and permissions
  async initializeDefaultRoles(): Promise<void> {
    // Create default permissions
    const defaultPermissions = [
      { resource: 'sources', action: 'read', description: 'View sources of truth data' },
      { resource: 'sources', action: 'write', description: 'Modify sources of truth data' },
      { resource: 'sources', action: 'admin', description: 'Full administrative access to sources' },
      { resource: 'bulletins', action: 'read', description: 'View bulletins and announcements' },
      { resource: 'bulletins', action: 'write', description: 'Create and modify bulletins' },
      { resource: 'bulletins', action: 'admin', description: 'Full bulletin management access' },
      { resource: 'knowledge', action: 'read', description: 'View knowledge base entries' },
      { resource: 'knowledge', action: 'write', description: 'Create and modify knowledge entries' },
      { resource: 'knowledge', action: 'admin', description: 'Full knowledge base administration' },
      { resource: 'chat', action: 'read', description: 'View chat history' },
      { resource: 'chat', action: 'write', description: 'Use chat and AI assistant' },
      { resource: 'gremlin', action: 'read', description: 'View Gremlin visualizations' },
      { resource: 'gremlin', action: 'write', description: 'Query and analyze graph data' },
      { resource: 'users', action: 'read', description: 'View user information' },
      { resource: 'users', action: 'admin', description: 'Manage users and roles' },
      { resource: 'system', action: 'admin', description: 'System-wide administrative access' },
    ];

    // Create permissions if they don't exist
    for (const perm of defaultPermissions) {
      try {
        await this.createPermission({
          id: nanoid(),
          name: `${perm.resource}:${perm.action}`,
          description: perm.description,
          resource: perm.resource,
          action: perm.action,
        });
      } catch (error) {
        // Permission might already exist, continue
        console.log(`Permission ${perm.resource}:${perm.action} already exists`);
      }
    }

    // Create default roles
    const defaultRoles = [
      {
        name: 'admin',
        description: 'Full system administrator with all permissions',
        permissions: [
          'sources:admin', 'bulletins:admin', 'knowledge:admin', 
          'chat:write', 'gremlin:write', 'users:admin', 'system:admin'
        ]
      },
      {
        name: 'operator',
        description: 'Operations team member with read/write access to sources and bulletins',
        permissions: [
          'sources:write', 'sources:read', 'bulletins:write', 'bulletins:read',
          'knowledge:write', 'knowledge:read', 'chat:write', 'gremlin:write'
        ]
      },
      {
        name: 'analyst',
        description: 'Data analyst with read access and AI tools',
        permissions: [
          'sources:read', 'bulletins:read', 'knowledge:read', 
          'chat:write', 'gremlin:read', 'users:read'
        ]
      },
      {
        name: 'viewer',
        description: 'Read-only access to most system data',
        permissions: [
          'sources:read', 'bulletins:read', 'knowledge:read', 'chat:read', 'gremlin:read'
        ]
      }
    ];

    for (const role of defaultRoles) {
      try {
        await this.createRole({
          id: nanoid(),
          name: role.name,
          description: role.description,
          permissions: role.permissions,
        });
      } catch (error) {
        console.log(`Role ${role.name} already exists`);
      }
    }
  }

  // Permission management
  async createPermission(permission: InsertPermission): Promise<Permission> {
    if (storage.createPermission) {
      return await storage.createPermission(permission);
    }
    throw new Error('Permission management not supported in current storage');
  }

  async getPermissions(): Promise<Permission[]> {
    if (storage.getPermissions) {
      return await storage.getPermissions();
    }
    return [];
  }

  // Role management
  async createRole(role: InsertRole): Promise<Role> {
    if (storage.createRole) {
      return await storage.createRole(role);
    }
    throw new Error('Role management not supported in current storage');
  }

  async getRoles(): Promise<Role[]> {
    if (storage.getRoles) {
      return await storage.getRoles();
    }
    return [];
  }

  async getRoleById(roleId: string): Promise<Role | undefined> {
    if (storage.getRoleById) {
      return await storage.getRoleById(roleId);
    }
    return undefined;
  }

  async updateRole(roleId: string, updates: Partial<InsertRole>): Promise<Role> {
    if (storage.updateRole) {
      return await storage.updateRole(roleId, updates);
    }
    throw new Error('Role management not supported in current storage');
  }

  async deleteRole(roleId: string): Promise<void> {
    if (storage.deleteRole) {
      return await storage.deleteRole(roleId);
    }
    throw new Error('Role management not supported in current storage');
  }

  // User role assignment
  async assignUserRole(assignment: InsertUserRole): Promise<UserRole> {
    if (storage.assignUserRole) {
      return await storage.assignUserRole({
        ...assignment,
        id: nanoid(),
      });
    }
    throw new Error('User role assignment not supported in current storage');
  }

  async getUserRoles(userId: string): Promise<UserRole[]> {
    if (storage.getUserRoles) {
      return await storage.getUserRoles(userId);
    }
    return [];
  }

  async removeUserRole(userRoleId: string): Promise<void> {
    if (storage.removeUserRole) {
      return await storage.removeUserRole(userRoleId);
    }
    throw new Error('User role management not supported in current storage');
  }

  // Permission checking
  async userHasPermission(userId: string, resource: string, action: string, sourceCode?: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const userRole of userRoles) {
      // Check if role is expired
      if (userRole.expiresAt && new Date() > userRole.expiresAt) {
        continue;
      }

      // Check if role is source-specific
      if (sourceCode && userRole.sourceCode && userRole.sourceCode !== sourceCode) {
        continue;
      }

      const role = await this.getRoleById(userRole.roleId);
      if (!role) continue;

      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
      const requiredPermission = `${resource}:${action}`;
      const adminPermission = `${resource}:admin`;
      const systemAdmin = 'system:admin';

      if (permissions.includes(requiredPermission) || 
          permissions.includes(adminPermission) || 
          permissions.includes(systemAdmin)) {
        return true;
      }
    }

    return false;
  }

  async getUserPermissions(userId: string, sourceCode?: string): Promise<string[]> {
    const userRoles = await this.getUserRoles(userId);
    const allPermissions = new Set<string>();

    for (const userRole of userRoles) {
      // Check if role is expired
      if (userRole.expiresAt && new Date() > userRole.expiresAt) {
        continue;
      }

      // Check if role is source-specific
      if (sourceCode && userRole.sourceCode && userRole.sourceCode !== sourceCode) {
        continue;
      }

      const role = await this.getRoleById(userRole.roleId);
      if (!role) continue;

      const permissions = Array.isArray(role.permissions) ? role.permissions : [];
      permissions.forEach(perm => allPermissions.add(perm));
    }

    return Array.from(allPermissions);
  }

  // Helper methods
  async isUserAdmin(userId: string): Promise<boolean> {
    return await this.userHasPermission(userId, 'system', 'admin');
  }

  async canAccessSource(userId: string, sourceCode: string, action: 'read' | 'write' | 'admin' = 'read'): Promise<boolean> {
    return await this.userHasPermission(userId, 'sources', action, sourceCode);
  }

  async getUsersWithRole(roleName: string): Promise<{ user: User; userRole: UserRole }[]> {
    if (!storage.getUsersWithRole) {
      return [];
    }
    return await storage.getUsersWithRole(roleName);
  }
}

export const rbacService = new RBACService();