import { Module } from '@nestjs/common';
import { Encrypter } from '@/domain/forum/application/cryptography/encrypter';
import { HashGenerator } from '@/domain/forum/application/cryptography/hash-generator';
import { HashComparer } from '@/domain/forum/application/cryptography/hash-comparer';
import { JwtEncrypter } from './jwt-encrypter';
import { BcryptHasher } from './bcrypt-hasher';
import { JwtService } from '@nestjs/jwt';
import { makeFactoryProvider } from '../utils/make-factory-provider.util';

@Module({
  providers: [
    makeFactoryProvider(JwtEncrypter, [JwtService], { provide: Encrypter }),
    { provide: HashGenerator, useClass: BcryptHasher },
    { provide: HashComparer, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashGenerator, HashComparer],
})
export class CryptographyModule {}
