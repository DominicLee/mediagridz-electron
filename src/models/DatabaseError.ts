export class DatabaseError extends Error {
  public readonly code?: number; // Optional error code
  public readonly query?: string; // Optional query causing the error

  constructor(message: string, code?: number, query?: string) {
    super(message);

    Object.setPrototypeOf(this, DatabaseError.prototype);

    this.code = code;
    this.query = query;

    this.name = 'DatabaseError';
  }
}
