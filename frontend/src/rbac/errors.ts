export function logAuthzFailure(details: {
  userId: string;
  userRole?: string;
  attemptedAction: string;
  attemptedRoute: string;
  reason: string;
}) {
  console.warn('[RBAC Authz Failure]', details);
}
