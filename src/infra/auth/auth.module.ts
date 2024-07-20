import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { EnvService } from '@/infra/env/env.service';
import { EnvModule } from '@/infra/env/env.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports : [EnvModule],
      inject: [EnvService],
      global: true,
      useFactory: (env: EnvService) => {
        const privateKey = env.get('JWT_PRIVATE_KEY');
        const publicKey = env.get('JWT_PUBLIC_KEY');
        return {
          privateKey: Buffer.from(privateKey, 'base64'),
          publicKey: Buffer.from(publicKey, 'base64'),
          signOptions: {
            algorithm: 'RS256',
            expiresIn: '1d',
          },
        };
      },
    }),
  ],
  providers: [
    EnvService,
    JwtStrategy,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AuthModule {}
