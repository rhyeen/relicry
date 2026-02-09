'use client';

import { ImageStorage } from '@/entities/Image';
import styles from './ImageUploader.module.css';
import { useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import Pica from "pica";
import DSButton from '@/components/ds/DSButton';
import DSDialog from '@/components/ds/DSDialog';
import DSSlider from '@/components/ds/DSSlider';
import DSLoadingOverlay from '@/components/ds/DSLoadingOverlay';

const ACCEPTED_IMAGE_FORMATS = {
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/webp": [".webp"],
};

const pica = Pica({
  // @NOTE: removing 'ww' to avoid Turbopack worker/runtime issues when running next dev.
  // This means resizing will block the main thread, but in practice it seems fast enough
  // on typical images that it’s not a problem. 
  features: ["js", "wasm"],
});

async function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.src = src;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
  });
  return img;
}

function validateCropMeetsMinimum(cropPixels: Area, size: { width: number; height: number }) {
  if (cropPixels.width < size.width || cropPixels.height < size.height) {
    return `Crop is too small. Need at least ${size.width}×${size.height} pixels in the selected crop area.`;
  }
  return null;
}

function aspect(spec: { width: number; height: number }) {
  return spec.width / spec.height;
}

/**
 * Crop from original image to an output canvas using pica resize for quality.
 * - cropPixels is in original image pixel coordinates
 * - width/height are the final dimensions
 * - fills background first to remove transparency
 */
async function cropAndResizeToWebpBlob(opts: {
  img: HTMLImageElement;
  cropPixels: Area;
  width: number;
  height: number;
  quality: number;
  backgroundColor: string;
}): Promise<Blob> {
  const { img, cropPixels, width, height, quality, backgroundColor } = opts;

  // 1) Source crop canvas at native crop pixel size
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = Math.max(1, Math.floor(cropPixels.width));
  srcCanvas.height = Math.max(1, Math.floor(cropPixels.height));
  const srcCtx = srcCanvas.getContext("2d");
  if (!srcCtx) throw new Error("No 2D context");

  // Fill background to eliminate transparency
  srcCtx.fillStyle = backgroundColor;
  srcCtx.fillRect(0, 0, srcCanvas.width, srcCanvas.height);

  srcCtx.drawImage(
    img,
    cropPixels.x,
    cropPixels.y,
    cropPixels.width,
    cropPixels.height,
    0,
    0,
    srcCanvas.width,
    srcCanvas.height
  );

  // 2) Destination canvas at final output size
  const dstCanvas = document.createElement("canvas");
  dstCanvas.width = width;
  dstCanvas.height = height;

  // Fill background again (some resizers can keep alpha around)
  const dstCtx = dstCanvas.getContext("2d");
  if (!dstCtx) throw new Error("No 2D context");
  dstCtx.fillStyle = backgroundColor;
  dstCtx.fillRect(0, 0, width, height);

  // 3) High-quality resize
  await pica.resize(srcCanvas, dstCanvas);

  // 4) Encode WebP
  return await toBlobWebp(dstCanvas, quality);
}

function toBlobWebp(
  canvas: HTMLCanvasElement,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to encode WebP"))),
      "image/webp",
      quality
    );
  });
}

export type ImageStorageDraft = ImageStorage & { file?: File };

type ImageUploaderProps = {
  onChange: (images: { [key: string]: ImageStorageDraft | undefined; }) => void;
  sizes: { [key: string]: { width: number; height: number, quality: number } };
  disabled?: boolean;
  onError: (error: string) => void;
};

export default function ImageUploadDragDrop({ onChange, sizes, disabled, onError }: ImageUploaderProps) {
  const [source, setSource] = useState<{
    file: File;
    width: number;
    height: number;
    url: string;
  } | null>(null);

  const [previews, setPreviews] = useState<{ [key: string]: { url: string; file: File } | null }>({});
  const [cropping, setCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const tempCropPixelsRef = useRef<Area | null>(null);

  const currentSize = Object.keys(sizes).find(key => !previews[key]);

  const clearPreviews = useCallback(() => {
      for (const preview of Object.values(previews)) {
        if (preview) URL.revokeObjectURL(preview.url);
      }
      setPreviews({});
    }, [previews]);
  
    useEffect(() => {
      return () => {
        if (source) URL.revokeObjectURL(source.url);
        clearPreviews();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
  
  const onDrop = useCallback(
    async (files: File[]) => {
      onError('');
      clearPreviews();

      const file = files[0];
      if (!file) return;

      const typeOk = Object.keys(ACCEPTED_IMAGE_FORMATS).includes(file.type);
      if (!typeOk) {
        onError(`Unsupported file type. Please upload ${Object.values(ACCEPTED_IMAGE_FORMATS).flat().join(', ')}.`);
        return;
      }

      // Load dims early for basic sanity
      const url = URL.createObjectURL(file);
      try {
        const img = await loadHtmlImage(url);
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        // Soft sanity: the source needs to be at least big enough for *both* crops.
        // (Otherwise it's impossible to select a crop area with enough pixels.)
        const allWidths = Object.values(sizes).map(s => s.width);
        const allHeights = Object.values(sizes).map(s => s.height);
        const minW = Math.max(...allWidths);
        const minH = Math.max(...allHeights);
        if (w < minW || h < minH) {
          URL.revokeObjectURL(url);
          onError(
            `Image is too small (${w}×${h}). Needs to be at least ${minW}×${minH} to support your crop minimums.`
          );
          return;
        }

        // Store
        if (source) URL.revokeObjectURL(source.url);
        setSource({ file, width: w, height: h, url });
        // Start first crop
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        tempCropPixelsRef.current = null;
        clearPreviews();
      } catch (e: unknown) {
        URL.revokeObjectURL(url);
        onError((e as Error)?.message ?? "Failed to read image.");
      }
    },
    [sizes, source, clearPreviews, onError]
  );

  const closeCrop = () => {
    // Cancel upload
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    clearPreviews();
  };

  useEffect(() => {
    if (!currentSize && source) {
      const finalImages: { [key: string]: ImageStorageDraft } = {};
      for (const key of Object.keys(previews)) {
        const preview = previews[key];
        if (preview) {
          finalImages[key] = {
            path: '',
            url: preview.url,
            file: preview.file,
          };
        }
      }
      onChange(finalImages);
      // Don't revoke preview URLs since we're passing them up for use
      if (source) URL.revokeObjectURL(source.url);
      setSource(null);
    }
  }, [currentSize, previews, onChange, source]);

  const confirmCrop = async () => {
    if (!source || !currentSize) return;
    const cropArea = tempCropPixelsRef.current;
    if (!cropArea) return;
    const minErr = validateCropMeetsMinimum(cropArea, sizes[currentSize]);
    if (minErr) {
      onError(minErr);
      console.error('Crop validation error:', minErr);
      return;
    }
    // @NOTE: Intentionally do not reset crop/zoom between sizes
    // As it's likely you'll want similar crops for each size
    try {
      setCropping(true);
      const img = await loadHtmlImage(source.url);
      const blob = await cropAndResizeToWebpBlob({
        img,
        cropPixels: cropArea,
        width: sizes[currentSize].width,
        height: sizes[currentSize].height,
        quality: sizes[currentSize].quality,
        backgroundColor: "#ffffff",
      });
      const file = new File([blob], `${currentSize}.webp`, { type: "image/webp" });
      const previewUrl = URL.createObjectURL(blob);
      setPreviews((prev) => ({
        ...prev,
        [currentSize]: { url: previewUrl, file },
      }));
    } catch (e: unknown) {
      onError((e as Error)?.message ?? "Failed to generate preview.");
      console.error('Error generating preview:', e);
      return;
    } finally {
      setCropping(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    noClick: true, // we'll use a button
    accept: ACCEPTED_IMAGE_FORMATS,
    disabled,
  });

  return (
    <div className={styles.dragDropContainer}>
      <DSLoadingOverlay loading={cropping} error={null} />
      <div
        {...getRootProps()}
        className={`${styles.dropzone} ${isDragActive ? styles.active : ''} ${disabled ? styles.disabled : ''}`}
      >
        <input {...getInputProps()} />
        <DSButton onClick={open} label={disabled ? "Upload Disabled" : "Click to Upload or Drag and Drop"} disabled={disabled} />
      </div>
      <DSDialog
        open={source !== null && !!currentSize}
        title="Crop Image"
        description="Crop the uploaded image for each required size."
        content={
          <div className={styles.cropContainer}>
            { !!currentSize &&
              <div className={styles.cropper}>
                <Cropper
                  image={source?.url || ''}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect(sizes[currentSize])}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_croppedArea, croppedAreaPixels) => {
                    tempCropPixelsRef.current = croppedAreaPixels;
                  }}
                />
              </div>
            }
            <DSSlider.Single
              value={zoom}
              min={1}
              max={3}
              step={0.01}
              thumbAriaLabel="Slide to Zoom"
              onValueChange={setZoom}
              label="Slide to Zoom"
            />
          </div>
        }
        disablePointerDismissal
        actions={
          <>
            <DSDialog.Close onClick={closeCrop} />
            <DSDialog.Close text="Confirm Crop" onClick={confirmCrop} />
          </>
        }
      />
    </div>
  );
}