import { Either, left, right } from './either';

function doSomething(shouldSuccess: boolean): Either<string, string> {
  return shouldSuccess ? right('success') : left('failure');
}

describe('Either', () => {
  it('success result', () => {
    const successResult = doSomething(true);
    expect(successResult.isRight()).toBe(true);
    expect(successResult.isLeft()).toBe(false);
  });

  it('failure result', () => {
    const failureResult = doSomething(false);
    expect(failureResult.isLeft()).toBe(true);
    expect(failureResult.isRight()).toBe(false);
  });
});
