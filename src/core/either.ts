export class Left<L, R> {
  readonly value: L;

  constructor(value: L) {
    this.value = value;
  }

  isRight(): this is Right<L, R> {
    return false;
  }

  isLeft(): this is Left<L, R> {
    return true;
  }
}

export class Right<L, R> {
  readonly value: R;

  constructor(value: R) {
    this.value = value;
  }

  isRight(): this is Right<L, R> {
    return true;
  }

  isLeft(): this is Left<L, R> {
    return false;
  }
}

export const left = <L, R>(value: L): Either<L, R> => new Left<L, R>(value);
export const right = <L, R>(value: R): Either<L, R> => new Right<L, R>(value);

export type Either<L, R> = Left<L, R> | Right<L, R>;
