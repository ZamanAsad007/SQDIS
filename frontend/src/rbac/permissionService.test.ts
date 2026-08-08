import { describe, it, expect } from 'vitest';
import { permissionService } from './permissionService';
import type { PermissionString } from './types';

describe('RBAC Permission Matrix', () => {
  it('grants permissions to OWNER', () => {
    const res = permissionService.hasPermission('OWNER', 'dashboard:read' as PermissionString);
    expect(res.hasPermission).toBe(true);
  });

  it('restricts admin/delete permissions for DEVELOPER', () => {
    const res = permissionService.hasPermission('DEVELOPER', 'organization:delete' as PermissionString);
    expect(res.hasPermission).toBe(false);
  });
});

