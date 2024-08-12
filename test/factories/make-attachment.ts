import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infra/database/prisma/prisma.service';
import { PrismaAttachmentMapper } from '@/infra/database/prisma/mappers/prisma-attachment-mapper';
import {
  Attachment,
  AttachmentProps,
} from '@/domain/forum/enterprise/entities/attachment';

export const makeAttachment = (override: Partial<AttachmentProps> = {}) => {
  const attachment = Attachment.create({
    title: faker.lorem.slug(),
    url: faker.internet.url(),
    ...override,
  });
  return attachment;
};

@Injectable()
export class AttachmentFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaAttachment(
    override: Partial<AttachmentProps> = {},
  ): Promise<Attachment> {
    const attachment = makeAttachment(override);

    await this.prisma.attachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    });

    return attachment;
  }
}
