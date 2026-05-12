export type UserRole = 'admin' | 'candidate';

export interface AuthUser {
  sub: number;
  role: UserRole;
  candidateId?: number;
}
