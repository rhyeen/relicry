import "server-only";

import { getStorageAdmin } from "@/lib/firebaseAdmin";
import type { storage } from "firebase-admin";
import { randomUUID } from "crypto";
import { isEmulated } from "@/lib/environment";

export type BucketLike = ReturnType<storage.Storage["bucket"]>;
type FileURL = string;

export class FileStorage {
  protected bucket: BucketLike;

  constructor(bucket?: BucketLike) {
    this.bucket = bucket || getStorageAdmin().bucket();
  }

  public get Bucket(): BucketLike {
    return this.bucket;
  }

  /**
   * Uploads a file and (optionally) returns a Firebase download-token URL.
   *
   * IMPORTANT:
   * - cacheControl/contentType belong at TOP LEVEL of FileMetadata
   * - firebaseStorageDownloadTokens belongs in CUSTOM metadata (FileMetadata.metadata)
   */
  protected async uploadFile(
    path: string,
    buffer: Buffer,
    isImmutable: boolean,
    contentType = "application/octet-stream",
    returnUrl = false
  ): Promise<FileURL | null> {
    const file = this.bucket.file(path);
    const token = returnUrl ? this.getToken() : undefined;

    await file.save(buffer, {
      resumable: false,
      metadata: {
        contentType,
        cacheControl: isImmutable
          ? "public,max-age=31536000,immutable"
          : "no-cache",
        // Custom metadata (this is where Firebase stores download tokens)
        metadata: token
          ? { firebaseStorageDownloadTokens: token }
          : undefined,
      },
    });

    if (!token) return null;

    return this.firebaseDownloadUrl({
      bucket: this.bucket.name,
      objectPath: path,
      token,
    });
  }

  /**
   * Build the download URL for prod or emulator.
   * In emulator mode, we use the emulator host + the same REST-ish path shape.
   */
  protected firebaseDownloadUrl(opts: {
    bucket: string;
    objectPath: string;
    token: string;
  }) {
    const encodedPath = encodeURIComponent(opts.objectPath);
    const host = isEmulated ? "http://localhost:9197" : "https://firebasestorage.googleapis.com";
    return `${host}/v0/b/${opts.bucket}/o/${encodedPath}?alt=media&token=${opts.token}`;
  }

  protected getToken(): string {
    return randomUUID();
  }
}
