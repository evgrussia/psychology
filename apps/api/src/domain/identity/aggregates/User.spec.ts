import { User } from './User';
import { Email } from '../value-objects/Email';
import { UserStatus } from '../value-objects/UserStatus';
import { Role } from '../value-objects/Role';

describe('User Aggregate', () => {
  it('should create a new user with default role and status', () => {
    const id = 'user-1';
    const emailStr = 'test@example.com';
    const email = Email.create(emailStr);
    
    const user = User.create(id, email, null, null);
    
    expect(user.id).toBe(id);
    expect(user.email?.value).toBe(emailStr);
    expect(user.status).toBe(UserStatus.ACTIVE);
    expect(user.roles).toContain(Role.CLIENT);
    expect(user.domainEvents.length).toBe(1);
    expect(user.domainEvents[0].constructor.name).toBe('UserCreatedEvent');
  });

  it('should throw error if no contact method provided', () => {
    expect(() => {
      User.create('user-1', null, null, null);
    }).toThrow('At least one contact method is required');
  });

  it('should assign a new role if not already present', () => {
    const user = User.create('user-1', Email.create('test@example.com'), null, null);
    
    user.assignRole(Role.OWNER);
    
    expect(user.roles).toContain(Role.OWNER);
    expect(user.roles.length).toBe(2);
  });

  it('should not duplicate roles', () => {
    const user = User.create('user-1', Email.create('test@example.com'), null, null);
    
    user.assignRole(Role.CLIENT);
    
    expect(user.roles.length).toBe(1);
  });
});
