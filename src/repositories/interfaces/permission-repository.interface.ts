import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { Permission } from '@entities/permission.entity';

/**
 * Permission repository interface
 */
export interface IPermissionRepository extends IRepository<Permission, string | Types.ObjectId> {
  /**
   * Find permission by name
   * @param name - Permission name
   * @returns Permission if found, null otherwise
   */
  findByName(name: string): Promise<Permission | null>;

  /**
   * List all permissions
   * @returns Array of all permissions
   */
  list(): Promise<Permission[]>;
}
