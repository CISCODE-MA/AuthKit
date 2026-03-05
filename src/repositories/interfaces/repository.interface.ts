/**
 * Base repository interface for CRUD operations
 * @template T - Entity type
 * @template ID - ID type (string or ObjectId)
 */
export interface IRepository<T, ID = string> {
  /**
   * Create a new entity
   * @param data - Partial entity data
   * @returns Created entity with generated ID
   */
  create(data: Partial<T>): Promise<T>;

  /**
   * Find entity by ID
   * @param id - Entity identifier
   * @returns Entity if found, null otherwise
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Update entity by ID
   * @param id - Entity identifier
   * @param data - Partial entity data to update
   * @returns Updated entity if found, null otherwise
   */
  updateById(id: ID, data: Partial<T>): Promise<T | null>;

  /**
   * Delete entity by ID
   * @param id - Entity identifier
   * @returns Deleted entity if found, null otherwise
   */
  deleteById(id: ID): Promise<T | null>;
}
