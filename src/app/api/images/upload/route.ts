import { AdminRole } from "@/entities/AdminRole";
import { ImageExtension, ImageSize } from "@/entities/Image";
import { ImageStorage } from "@/server/storage/image.storage";
import {
  BadRequest,
  handleJsonResponse,
  handleRouteError,
  authenticateUser,
} from "@/server/routeHelpers";
import { randomUUID } from "crypto";

function isImageSize(value: string): value is ImageSize {
  return (Object.values(ImageSize) as string[]).includes(value);
}

function getExtensionFromFile(file: File): ImageExtension {
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "png";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "jpg";
  if (name.endsWith(".webp")) return "webp";
  const type = file.type.toLowerCase();
  if (type === "image/png") return "png";
  if (type === "image/jpeg") return "jpg";
  return "webp";
}

export async function POST(req: Request) {
  try {
    await authenticateUser(req, {
      adminRole: AdminRole.SuperAdmin,
    });

    const form = await req.formData();
    const keysRaw = form.get("keys");
    if (!keysRaw) {
      throw new BadRequest("Missing form field: keys");
    }
    let keys: string[] = [];
    try {
      const parsed = JSON.parse(String(keysRaw));
      if (!Array.isArray(parsed)) {
        throw new Error("keys must be an array");
      }
      keys = parsed.map((k) => String(k));
    } catch (e) {
      throw new BadRequest(`Invalid keys payload: ${(e as Error).message}`);
    }
    if (keys.length === 0) {
      throw new BadRequest("No image keys provided");
    }

    const buffers: { size: ImageSize; buffer: Buffer; extension: ImageExtension }[] = [];
    for (const key of keys) {
      if (!isImageSize(key)) {
        throw new BadRequest(`Unsupported image key: ${key}`);
      }
      const file = form.get(key);
      if (!(file instanceof File)) {
        throw new BadRequest(`Missing file for key: ${key}`);
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      buffers.push({
        size: key,
        buffer,
        extension: getExtensionFromFile(file),
      });
    }

    const extension = buffers[0]?.extension ?? "webp";
    const imageId = randomUUID();
    const imageStorage = new ImageStorage();
    const image = await imageStorage.upload(
      imageId,
      buffers.map(({ size, buffer }) => ({ size, buffer })),
      extension,
      false,
    );

    return handleJsonResponse({ image });
  } catch (e) {
    return handleRouteError(e);
  }
}
