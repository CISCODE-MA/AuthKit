import type { ExecutionContext } from '@nestjs/common';

/**
 * Creates a mock ExecutionContext for guard testing
 * @param userRoles - Optional array of role IDs for the user
 * @param authHeader - Optional authorization header value
 * @returns Mock ExecutionContext
 */
export function createMockExecutionContext(
    userRoles?: string[],
    authHeader?: string,
): ExecutionContext {
    const response = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn().mockReturnThis(),
    };

    const request: any = {
        headers: authHeader ? { authorization: authHeader } : {},
        user: userRoles ? { roles: userRoles } : undefined,
    };

    return {
        switchToHttp: () => ({
            getRequest: () => request,
            getResponse: () => response,
        }),
    } as ExecutionContext;
}

/**
 * Creates a mock ExecutionContext with user roles for role-based guard testing
 * @param userRoles - Array of role IDs for the user
 * @returns Mock ExecutionContext with user roles
 */
export function createMockContextWithRoles(
    userRoles: string[] = [],
): ExecutionContext {
    return createMockExecutionContext(userRoles);
}

/**
 * Creates a mock ExecutionContext with authorization header for authentication guard testing
 * @param authHeader - Authorization header value
 * @returns Mock ExecutionContext with auth header
 */
export function createMockContextWithAuth(
    authHeader?: string,
): ExecutionContext {
    return createMockExecutionContext(undefined, authHeader);
}
