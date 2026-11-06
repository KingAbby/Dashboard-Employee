import { compare, hash } from 'bcrypt';

export const BCRYPT_ROUNDS = 10;

export const hashPassword = (plain: string): Promise<string> => hash(plain, BCRYPT_ROUNDS);

export const verifyPassword = (plain: string, passwordHash: string): Promise<boolean> =>
  compare(plain, passwordHash);
