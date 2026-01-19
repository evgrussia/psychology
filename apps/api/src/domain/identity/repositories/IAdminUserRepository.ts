export interface AdminUserListItem {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string | null;
  status: string;
  roles: string[];
  lastLoginAt: Date | null;
}

export interface IAdminUserRepository {
  listAdminUsers(): Promise<AdminUserListItem[]>;
  getAdminRoles(userId: string): Promise<string[] | null>;
  countAdminUsersByRole(roleCode: string): Promise<number>;
  isAdminRole(roleCode: string): Promise<boolean>;
  setAdminRole(userId: string, roleCode: string): Promise<void>;
  setUserStatus(userId: string, status: string): Promise<void>;
  markUserDeleted(userId: string): Promise<void>;
}
