export function isAdminPortalRole(role: string): boolean {
  return role === 'ADMIN' || role === 'TICKET_ASSIGNEE';
}

export function isFullAdmin(role: string): boolean {
  return role === 'ADMIN';
}

export function homePathForRole(role: string): string {
  if (role === 'ADMIN') return '/dashboard';
  if (role === 'TICKET_ASSIGNEE') return '/requests';
  return '/portal';
}

export function formatUserRole(role: string): string {
  if (role === 'ADMIN') return 'Admin';
  if (role === 'TICKET_ASSIGNEE') return 'Ticket Assignee';
  if (role === 'USER') return 'User';
  return role;
}
