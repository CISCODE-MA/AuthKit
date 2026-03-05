<<<<<<< HEAD
import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { User } from '@entities/user.entity';
=======
import type { Types } from "mongoose";
import type { IRepository } from "./repository.interface";
import type { User } from "@entities/user.entity";
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

/**
 * User repository interface extending base repository
 */
<<<<<<< HEAD
export interface IUserRepository extends IRepository<User, string | Types.ObjectId> {
=======
export interface IUserRepository extends IRepository<
  User,
  string | Types.ObjectId
> {
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e
  /**
   * Find user by email address
   * @param email - User email
   * @returns User if found, null otherwise
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find user by email with password field included
   * @param email - User email
   * @returns User with password if found, null otherwise
   */
  findByEmailWithPassword(email: string): Promise<User | null>;

  /**
   * Find user by username
   * @param username - Unique username
   * @returns User if found, null otherwise
   */
  findByUsername(username: string): Promise<User | null>;

  /**
   * Find user by phone number
   * @param phoneNumber - User phone number
   * @returns User if found, null otherwise
   */
  findByPhone(phoneNumber: string): Promise<User | null>;

  /**
   * Find user by ID with populated roles and permissions
   * @param id - User identifier
   * @returns User with populated relations
   */
<<<<<<< HEAD
  findByIdWithRolesAndPermissions(id: string | Types.ObjectId): Promise<User | null>;
=======
  findByIdWithRolesAndPermissions(
    id: string | Types.ObjectId,
  ): Promise<User | null>;
>>>>>>> 3e15d93b706eeffb27c8710ef8c593767c9a564e

  /**
   * List users with optional filters
   * @param filter - Email and/or username filter
   * @returns Array of users matching filters
   */
  list(filter: { email?: string; username?: string }): Promise<User[]>;
}
