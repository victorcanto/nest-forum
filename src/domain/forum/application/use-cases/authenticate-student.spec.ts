import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { AuthenticateStudentUseCase } from './authenticate-student';
import { Encrypter } from '../cryptography/encrypter';
import { FakeEncrypter } from 'test/cryptography/fake-encrypter';
import { makeStudent } from 'test/factories/make-student';

type SutTypes = {
  studentsRepository: InMemoryStudentsRepository;
  hasher: FakeHasher;
  encrypter: Encrypter;
  sut: AuthenticateStudentUseCase;
};

const makeSut = (): SutTypes => {
  const studentsRepository = new InMemoryStudentsRepository();
  const hasher = new FakeHasher();
  const encrypter = new FakeEncrypter();
  const sut = new AuthenticateStudentUseCase(
    studentsRepository,
    hasher,
    encrypter,
  );
  return {
    studentsRepository,
    hasher,
    encrypter,
    sut,
  };
};

describe('Register a student', () => {
  it('should be able to authenticate a student', async () => {
    const { sut, studentsRepository, hasher } = makeSut();
    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await hasher.hash('123456'),
    });
    await studentsRepository.create(student);
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      access_token: expect.any(String),
    });
  });

  it('should compare hashed password upon authentication', async () => {
    const { sut, studentsRepository, hasher } = makeSut();
    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await hasher.hash('123456'),
    });
    await studentsRepository.create(student);
    const hashSpy = vi.spyOn(hasher, 'compare');
    const result = await sut.execute({
      email: 'johndoe@example.com',
      password: '123456',
    });
    expect(result.isRight()).toBe(true);
    expect(hashSpy).toHaveBeenCalledWith('123456', '123456-hashed');
    expect(result.value).toEqual({
      access_token: expect.any(String),
    });
  });
});
