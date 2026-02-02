import { Types } from 'mongoose';
import { IRepository } from './repository.interface';
import { User } from '@entities/user.entity';

/**
 * User repository interface extending base repository
 */
export interface IUserRepository extends IRepository<User, string | Types.ObjectId> {
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
  findByIdWithRolesAndPermissions(id: string | Types.ObjectId): Promise<User | null>;

  /**
   * List users with optional filters
   * @param filter - Email and/or username filter
   * @returns Array of users matching filters
   */
  list(filter: { email?: string; username?: string }): Promise<User[]>;
}
