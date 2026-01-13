export enum RoleScope {
  ADMIN = 'admin',
  PRODUCT = 'product',
}

export class Role {
  private constructor(
    public readonly code: string,
    public readonly scope: RoleScope,
  ) {}

  static readonly OWNER = new Role('owner', RoleScope.ADMIN);
  static readonly ASSISTANT = new Role('assistant', RoleScope.ADMIN);
  static readonly EDITOR = new Role('editor', RoleScope.ADMIN);
  static readonly CLIENT = new Role('client', RoleScope.PRODUCT);

  static fromCode(code: string): Role {
    switch (code) {
      case 'owner':
        return Role.OWNER;
      case 'assistant':
        return Role.ASSISTANT;
      case 'editor':
        return Role.EDITOR;
      case 'client':
        return Role.CLIENT;
      default:
        throw new Error(`Unknown role code: ${code}`);
    }
  }

  equals(other: Role): boolean {
    return this.code === other.code && this.scope === other.scope;
  }

  isAdmin(): boolean {
    return this.scope === RoleScope.ADMIN;
  }
}
