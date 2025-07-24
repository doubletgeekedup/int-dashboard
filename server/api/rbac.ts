import { Router } from 'express';
import { storage } from '../storage';
import { rbacService } from '../services/rbac-service';
import { insertRoleSchema, insertUserRoleSchema, insertPermissionSchema } from '@shared/schema';
import { nanoid } from 'nanoid';

export const rbacRouter = Router();

// Initialize RBAC system
rbacRouter.post('/initialize', async (req, res) => {
  try {
    await rbacService.initializeDefaultRoles();
    res.json({ message: 'RBAC system initialized successfully' });
  } catch (error) {
    console.error('Error initializing RBAC:', error);
    res.status(500).json({ error: 'Failed to initialize RBAC system' });
  }
});

// Role management
rbacRouter.get('/roles', async (req, res) => {
  try {
    const roles = await rbacService.getRoles();
    res.json(roles);
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

rbacRouter.post('/roles', async (req, res) => {
  try {
    const data = insertRoleSchema.parse({
      ...req.body,
      id: nanoid(),
    });
    const role = await rbacService.createRole(data);
    res.status(201).json(role);
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(400).json({ error: 'Failed to create role' });
  }
});

rbacRouter.get('/roles/:roleId', async (req, res) => {
  try {
    const role = await rbacService.getRoleById(req.params.roleId);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json(role);
  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ error: 'Failed to fetch role' });
  }
});

rbacRouter.put('/roles/:roleId', async (req, res) => {
  try {
    const updates = insertRoleSchema.partial().parse(req.body);
    const role = await rbacService.updateRole(req.params.roleId, updates);
    res.json(role);
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(400).json({ error: 'Failed to update role' });
  }
});

rbacRouter.delete('/roles/:roleId', async (req, res) => {
  try {
    await rbacService.deleteRole(req.params.roleId);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

// Permission management
rbacRouter.get('/permissions', async (req, res) => {
  try {
    const permissions = await rbacService.getPermissions();
    res.json(permissions);
  } catch (error) {
    console.error('Error fetching permissions:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

rbacRouter.post('/permissions', async (req, res) => {
  try {
    const data = insertPermissionSchema.parse({
      ...req.body,
      id: nanoid(),
    });
    const permission = await rbacService.createPermission(data);
    res.status(201).json(permission);
  } catch (error) {
    console.error('Error creating permission:', error);
    res.status(400).json({ error: 'Failed to create permission' });
  }
});

// User role assignments
rbacRouter.get('/users/:userId/roles', async (req, res) => {
  try {
    const userRoles = await rbacService.getUserRoles(req.params.userId);
    res.json(userRoles);
  } catch (error) {
    console.error('Error fetching user roles:', error);
    res.status(500).json({ error: 'Failed to fetch user roles' });
  }
});

rbacRouter.post('/users/:userId/roles', async (req, res) => {
  try {
    const data = insertUserRoleSchema.parse({
      ...req.body,
      id: nanoid(),
      userId: req.params.userId,
    });
    const userRole = await rbacService.assignUserRole(data);
    res.status(201).json(userRole);
  } catch (error) {
    console.error('Error assigning user role:', error);
    res.status(400).json({ error: 'Failed to assign user role' });
  }
});

rbacRouter.delete('/user-roles/:userRoleId', async (req, res) => {
  try {
    await rbacService.removeUserRole(req.params.userRoleId);
    res.json({ message: 'User role removed successfully' });
  } catch (error) {
    console.error('Error removing user role:', error);
    res.status(500).json({ error: 'Failed to remove user role' });
  }
});

// Permission checking
rbacRouter.get('/users/:userId/permissions', async (req, res) => {
  try {
    const { sourceCode } = req.query;
    const permissions = await rbacService.getUserPermissions(
      req.params.userId, 
      sourceCode as string
    );
    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    res.status(500).json({ error: 'Failed to fetch user permissions' });
  }
});

rbacRouter.post('/users/:userId/check-permission', async (req, res) => {
  try {
    const { resource, action, sourceCode } = req.body;
    const hasPermission = await rbacService.userHasPermission(
      req.params.userId,
      resource,
      action,
      sourceCode
    );
    res.json({ hasPermission });
  } catch (error) {
    console.error('Error checking permission:', error);
    res.status(500).json({ error: 'Failed to check permission' });
  }
});

// Utility endpoints
rbacRouter.get('/users/:userId/is-admin', async (req, res) => {
  try {
    const isAdmin = await rbacService.isUserAdmin(req.params.userId);
    res.json({ isAdmin });
  } catch (error) {
    console.error('Error checking admin status:', error);
    res.status(500).json({ error: 'Failed to check admin status' });
  }
});

rbacRouter.get('/roles/:roleName/users', async (req, res) => {
  try {
    const users = await rbacService.getUsersWithRole(req.params.roleName);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users with role:', error);
    res.status(500).json({ error: 'Failed to fetch users with role' });
  }
});