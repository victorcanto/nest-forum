import { faker } from '@faker-js/faker';
import {
  Student,
  StudentProps,
} from '@/domain/forum/enterprise/entities/student';

export const makeStudent = (override: Partial<StudentProps> = {}) => {
  const student = Student.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...override,
  });
  return student;
};
