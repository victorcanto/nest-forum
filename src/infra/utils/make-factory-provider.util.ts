import { Provider } from '@nestjs/common';

export function makeFactoryProvider<T>(
  provide: new (...args: any[]) => T,
  inject: any[],
): Provider {
  return {
    provide,
    useFactory: (...args: any[]) => new provide(...args),
    inject,
  };
}
