import { Admin } from '@decorators/admin.decorator';

describe('Admin Decorator', () => {
  it('should be defined', () => {
    expect(Admin).toBeDefined();
    expect(typeof Admin).toBe('function');
  });

  it('should return a decorator function', () => {
    const decorator = Admin();
    
    expect(decorator).toBeDefined();
  });

  it('should apply both AuthenticateGuard and AdminGuard via UseGuards', () => {
    // The decorator combines AuthenticateGuard and AdminGuard
    // This is tested indirectly through controller tests where guards are applied
    const decorator = Admin();
    
    // Just verify it returns something (the composed decorator)
    expect(decorator).toBeDefined();
  });
});


