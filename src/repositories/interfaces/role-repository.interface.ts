<<<<<<< HEAD
import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { Role } from '@entities/role.entity';
=======
import type { Types } from "mongoose";
import type { IRepository } from "./repository.interface";
import type { Role } from "@entities/role.entity";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * Role repository interface
 */
<<<<<<< HEAD
export interface IRoleRepository extends IRepository<Role, string | Types.ObjectId> {
=======
export interface IRoleRepository extends IRepository<
  Role,
  string | Types.ObjectId
> {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
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
