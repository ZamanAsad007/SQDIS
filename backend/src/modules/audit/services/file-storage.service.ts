import { Injectable } from '@nestjs/common';
import { mkdir, writeFile } from 'fs/promises';
import { join, resolve } from 'path';
import type { IFileStorageService } from './audit-export.service';

@Injectable()
export class FileStorageService implements IFileStorageService {
  private readonly storageRoot = resolve(
    process.env.AUDIT_EXPORT_DIR || join(process.cwd(), 'storage', 'audit-exports'),
  );

  async saveFile(buffer: Buffer, filename: string, organizationId: string): Promise<string> {
    const safeOrganizationId = this.safePathSegment(organizationId);
    const safeFilename = this.safePathSegment(filename);
    const relativePath = join(safeOrganizationId, safeFilename);
    const absolutePath = this.getFilePath(relativePath);

    await mkdir(resolve(absolutePath, '..'), { recursive: true });
    await writeFile(absolutePath, buffer);

    return relativePath;
  }

  getFilePath(relativePath: string): string {
    const absolutePath = resolve(this.storageRoot, relativePath);

    if (!absolutePath.startsWith(this.storageRoot)) {
      throw new Error('Invalid export file path');
    }

    return absolutePath;
  }

  private safePathSegment(value: string): string {
    return value.replace(/[^a-zA-Z0-9._-]/g, '_');
  }
}
