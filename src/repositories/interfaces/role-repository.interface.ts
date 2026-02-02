import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { Role } from '@entities/role.entity';

/**
 * Role repository interface
 */
export interface IRoleRepository extends IRepository<Role, string | Types.ObjectId> {
  /**
   * Find role by name
   * @param name - Role name
   * @returns Role if found, null otherwise
   */
  findByName(name: string): Promise<Role | null>;

  /**
   * List all roles with populated permissions
   * @returns Array of roles with permissions
   */
  list(): Promise<Role[]>;

  /**
   * Find multiple roles by their IDs
   * @param ids - Array of role identifiers
   * @returns Array of roles
   */
  findByIds(ids: string[]): Promise<Role[]>;
}
