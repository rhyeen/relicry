import 'server-only';

import { storageAdmin } from '@/lib/firebaseAdmin';
import type { storage } from 'firebase-admin';
import { randomUUID } from 'crypto';

export type BucketLike = ReturnType<storage.Storage['bucket']>;

type FileURL = string;

export class FileStorage {
  protected bucket: BucketLike;

  constructor(bucket?: BucketLike) {
    this.bucket = bucket || storageAdmin.bucket();
  }

  public get Bucket(): BucketLike {
    return this.bucket;
  }

  /**
   * 
   * @returns the public URL of the uploaded file
   */
  protected async uploadFile(
    path: string,
    buffer: Buffer<ArrayBufferLike>,
    isImmutable: boolean,
    contentType?: string,
    returnUrl?: boolean,
  ): Promise<FileURL | null> {
    const file = this.bucket.file(path);
    const token = returnUrl ? this.getToken() : undefined;
    const metadata = {
      resumable: false,
      metadata: {
        // mimic production behavior for immutable versioned assets
        cacheControl: isImmutable ? 'public,max-age=31536000,immutable' : 'no-cache',
        contentType: contentType || 'application/octet-stream',
      }
    };
    if (token) {
      Object.assign(metadata.metadata, {
        firebaseStorageDownloadTokens: token,
      });
    }
    await file.save(buffer, metadata);
    return token ? this.firebaseDownloadUrl({
      bucket: this.bucket.name,
      objectPath: path,
      token,
    }) : null;
  }

  protected firebaseDownloadUrl(opts: {
    bucket: string;
    objectPath: string;
    token: string;
  }) {
    const encodedPath = encodeURIComponent(opts.objectPath);
    return `https://firebasestorage.googleapis.com/v0/b/${opts.bucket}/o/${encodedPath}?alt=media&token=${opts.token}`;
  }

  protected getToken(): string {
    return randomUUID();
  }
}
