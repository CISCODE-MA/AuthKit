<<<<<<< HEAD
import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { Permission } from '@entities/permission.entity';
=======
import type { Types } from "mongoose";
import type { IRepository } from "./repository.interface";
import type { Permission } from "@entities/permission.entity";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Permission repository interface
 */
<<<<<<< HEAD
export interface IPermissionRepository extends IRepository<Permission, string | Types.ObjectId> {
=======
export interface IPermissionRepository extends IRepository<
  Permission,
  string | Types.ObjectId
> {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
