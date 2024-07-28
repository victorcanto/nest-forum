import { faker } from '@faker-js/faker';
import {
  Student,
  StudentProps,
} from '@/domain/forum/enterprise/entities/student';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaStudentMapper } from '@/infra/database/prisma/mappers/prisma-student-mapper';

export const makeStudent = (override: Partial<StudentProps> = {}) => {
  const student = Student.create({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
    ...override,
  });
  return student;
};

@Injectable()
export class StudentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaStudent(
    override: Partial<StudentProps> = {},
  ): Promise<Student> {
    const student = makeStudent(override);

    await this.prisma.user.create({
      data: PrismaStudentMapper.toPrisma(student),
    });

    return student;
  }
}
