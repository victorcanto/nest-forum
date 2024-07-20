import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { JwtService } from '@nestjs/jwt';

export class JwtEncrypter implements Encrypter {
  constructor(private readonly jwt: JwtService) {}

  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return await this.jwt.signAsync(payload);
  }
}
