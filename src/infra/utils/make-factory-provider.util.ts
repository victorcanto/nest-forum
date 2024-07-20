import { Provider } from '@nestjs/common';

interface FactoryOptions<T> {
  provide?: string | symbol | Function;
  useFactory?: (...args: any[]) => T;
}

export function makeFactoryProvider<T>(
  type: new (...args: any[]) => T,
  inject: any[],
): Provider;

export function makeFactoryProvider<T>(
  type: new (...args: any[]) => T,
  inject: any[],
  options: FactoryOptions<T>,
): Provider;

export function makeFactoryProvider<T>(
  type: new (...args: any[]) => T,
  inject: any[],
  options?: FactoryOptions<T>,
): Provider {
  const provide = options?.provide || type;
  const useFactory =
    options?.useFactory || ((...args: any[]) => new type(...args));
  return {
    provide,
    useFactory,
    inject,
  };
}
