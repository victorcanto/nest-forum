import { InMemoryStudentsRepository } from 'test/repositories/in-memory/in-memory-students-repository';
import { RegisterStudentUseCase } from './register-student';
import { FakeHasher } from 'test/cryptography/fake-hasher';
import { StudentAlreadyExistsError } from './errors/student-already-exists-error';
import { makeStudent } from 'test/factories/make-student';

type SutTypes = {
  hasher: FakeHasher;
  studentsRepository: InMemoryStudentsRepository;
  sut: RegisterStudentUseCase;
};

const makeSut = (): SutTypes => {
  const hasher = new FakeHasher();
  const studentsRepository = new InMemoryStudentsRepository();
  const sut = new RegisterStudentUseCase(studentsRepository, hasher);
  return {
    hasher,
    studentsRepository,
    sut,
  };
};

describe('Register a student', () => {
  it('should be able to register a student', async () => {
    const { sut, studentsRepository } = makeSut();
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });
    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({ student: studentsRepository.items[0] });
  });

  it('should hash the password upon registration', async () => {
    const { sut, studentsRepository, hasher } = makeSut();
    const hashSpy = vi.spyOn(hasher, 'hash');
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });
    const hashedPassword = await hasher.hash('123456');
    expect(hashSpy).toHaveBeenCalledWith('123456');
    expect(result.isRight()).toBe(true);
    expect(studentsRepository.items[0].password).toEqual(hashedPassword);
  });

  it('should not be able to register a student with the same email', async () => {
    const { sut, studentsRepository, hasher } = makeSut();
    const student = makeStudent({
      email: 'johndoe@example.com',
      password: await hasher.hash('123456'),
    });
    await studentsRepository.create(student);
    const result = await sut.execute({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password: '123456',
    });
    expect(result.isLeft()).toBe(true);
    expect(result.value).toEqual(
      new StudentAlreadyExistsError('johndoe@example.com'),
    );
  });
});
