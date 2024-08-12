import { Module } from '@nestjs/common';
import { makeFactoryProvider } from '../utils/make-factory-provider.util';
import { R2Storage } from './r2-storage';
import { Uploader } from '@/domain/forum/application/storage/uploader';
import { EnvService } from '../env/env.service';
import { EnvModule } from '../env/env.module';

@Module({
  imports: [EnvModule],
  providers: [
    makeFactoryProvider(R2Storage, [EnvService], { provide: Uploader }),
  ],
  exports: [Uploader],
})
export class StorageModule {}
