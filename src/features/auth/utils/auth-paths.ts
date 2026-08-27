export function homePathForRole(role: string): string {
  return role === 'ADMIN' ? '/dashboard' : '/portal';
}
