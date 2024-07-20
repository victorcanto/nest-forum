import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { compare, hash } from 'bcryptjs';

export class BcryptHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    const hashed = await hash(plain, 8);
    return hashed;
  }
  async compare(plain: string, hash: string): Promise<boolean> {
    const result = await compare(plain, hash);
    return result;
  }
}
