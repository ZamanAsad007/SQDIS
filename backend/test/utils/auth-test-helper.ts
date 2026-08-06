export interface MockUserPayload {
  id: string;
  email: string;
  name: string;
  role?: string;
  organizationId?: string;
}

export const mockUserFixture: MockUserPayload = {
  id: 'usr-test-uuid-1234',
  email: 'testuser@sqdis.dev',
  name: 'Test User',
  role: 'ADMIN',
  organizationId: 'org-test-uuid-5678',
};

export const mockOrganizationFixture = {
  id: 'org-test-uuid-5678',
  name: 'Test Organization',
  slug: 'test-org',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

/**
 * Generates a mock JWT payload for testing authorized routes.
 */
export const createMockJwtPayload = (overrides?: Partial<MockUserPayload>) => ({
  sub: overrides?.id || mockUserFixture.id,
  email: overrides?.email || mockUserFixture.email,
  name: overrides?.name || mockUserFixture.name,
  role: overrides?.role || mockUserFixture.role,
  organizationId: overrides?.organizationId || mockUserFixture.organizationId,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
});

/**
 * Creates Authorization header object with Bearer token for HTTP tests.
 */
export const createMockAuthHeaders = (token = 'mock-jwt-token-string-xyz') => ({
  Authorization: `Bearer ${token}`,
});
