'use client';

import { getImageHeight, getImageQuality, getImageWidth, ImageSize, ImageStorage } from '@/entities/Image';
import DSAvatar, { type DSAvatarUser } from '@/components/ds/DSAvatar';
import DSField from '@/components/ds/DSField';
import DSText from '@/components/ds/DSText';
import ImageUploadDragDrop, { type ImageStorageDraft, type ImageUploadSizeSpec } from './ImageUploadDragDrop';
import StoredImage from '../StoredImage';
import DSButton from '@/components/ds/DSButton';
import { useMemo, useState } from 'react';
import styles from './ImageUploader.module.css';

type ImageUploaderProps = {
  label?: string;
  description?: string;
  images: { [key: string]: ImageStorage | undefined; };
  onChange: (images: { [key: string]: ImageStorage | undefined; }) => void;
  required?: boolean;
  type: 'illustration' | 'promotedItem' | 'profile' | 'banner';
  avatarUser?: DSAvatarUser | null;
};

const PROFILE_IMAGE_SIZE = {
  width: 200,
  height: 200,
  quality: 86,
  label: 'Profile image',
  cropShape: 'round',
} satisfies ImageUploadSizeSpec;

export default function ImageUploader({ avatarUser, label, description, images, onChange, required, type }: ImageUploaderProps) {
  const [error, setError] = useState('');
  const [replacing, setReplacing] = useState(false);
  const hasImage = Object.values(images).some(image => image !== undefined);
  const isReplacing = hasImage && replacing;

  const sizes = useMemo(() => {
    const _sizes: { [key: string]: ImageUploadSizeSpec } = {};
    if (type === 'illustration') {
      _sizes[ImageSize.CardFull] = {
        width: getImageWidth(ImageSize.CardFull),
        height: getImageHeight(ImageSize.CardFull),
        quality: getImageQuality(ImageSize.CardFull),
        label: 'Full card art',
      };
      _sizes[ImageSize.Card] = {
        width: getImageWidth(ImageSize.Card),
        height: getImageHeight(ImageSize.Card),
        quality: getImageQuality(ImageSize.Card),
        label: 'Card art',
      };
      _sizes[ImageSize.CardPreview] = {
        width: getImageWidth(ImageSize.CardPreview),
        height: getImageHeight(ImageSize.CardPreview),
        quality: getImageQuality(ImageSize.CardPreview),
        label: 'Preview thumbnail',
      };
    } else if (type === 'promotedItem' || type === 'banner') {
      _sizes[ImageSize.Banner] = {
        width: getImageWidth(ImageSize.Banner),
        height: getImageHeight(ImageSize.Banner),
        quality: getImageQuality(ImageSize.Banner),
        label: 'Banner image',
      };
      if (type === 'banner') {
        return _sizes;
      }
      _sizes[ImageSize.Thumb] = {
        width: getImageWidth(ImageSize.Thumb),
        height: getImageHeight(ImageSize.Thumb),
        quality: getImageQuality(ImageSize.Thumb),
        label: 'Thumbnail',
      };
    } else if (type === 'profile') {
      _sizes[ImageSize.Thumb] = PROFILE_IMAGE_SIZE;
    }
    return _sizes;
  }, [type]);

  const handleChange = (nextImages: { [key: string]: ImageStorage | undefined }) => {
    revokeDraftUrls(images);
    setReplacing(false);
    setError('');
    onChange(nextImages);
  };

  const removeImages = () => {
    revokeDraftUrls(images);
    setReplacing(false);
    setError('');
    onChange({});
  };

  return (
    <>
      {(label || description) &&
        <DSField.Root className={styles.fieldRoot}>
          {label && <DSField.Label label={label || 'Upload Image'} required={required} />}
          <DSField.Description description={description} />
          <div className={styles.uploader} data-type={type}>
            {hasImage && (
              <ImagePreview
                avatarUser={avatarUser}
                images={images}
                onRemove={removeImages}
                onReplace={() => setReplacing(true)}
                type={type}
              />
            )}
            {(!hasImage || isReplacing) && (
              <div className={styles.replacementArea} data-replacing={isReplacing ? 'true' : undefined}>
                {isReplacing && (
                  <div className={styles.replaceHeader}>
                    <DSText.Caption>Choose a replacement below. Your current image stays in place until the new crop is confirmed.</DSText.Caption>
                    <DSButton onClick={() => setReplacing(false)} label="Cancel Replace" variant="ghost" />
                  </div>
                )}
                <ImageUploadDragDrop
                  onChange={handleChange}
                  sizes={sizes}
                  onError={setError}
                  variant={type === 'profile' ? 'profile' : 'default'}
                  copy={type === 'profile' ? {
                    title: 'Drop a profile image here',
                    description: 'JPG, PNG, or WebP. Crop once for a 200×200 avatar.',
                    buttonLabel: 'Choose Profile Image',
                    activeTitle: 'Release to use this image',
                    cropTitle: 'Crop Profile Image',
                    cropDescription: 'Frame your avatar as a square.',
                    confirmLabel: 'Use This Crop',
                  } : type === 'banner' ? {
                    title: 'Drop a banner image here',
                    description: 'JPG, PNG, or WebP. Crop once for a 1920×480 banner.',
                    buttonLabel: 'Choose Banner Image',
                    activeTitle: 'Release to use this banner',
                    cropTitle: 'Crop Banner Image',
                    cropDescription: 'Frame the artist banner.',
                    confirmLabel: 'Use This Banner',
                  } : undefined}
                />
              </div>
            )}
          </div>
          <DSField.Error error={error} />
        </DSField.Root>
      }
    </>
  );
}

function ImagePreview({
  avatarUser,
  images,
  onRemove,
  onReplace,
  type,
}: Readonly<{
  avatarUser?: DSAvatarUser | null;
  images: { [key: string]: ImageStorage | undefined; };
  onRemove: () => void;
  onReplace: () => void;
  type: ImageUploaderProps['type'];
}>) {
  if (type === 'profile') {
    const image = images[ImageSize.Thumb] ?? images[ImageSize.Banner] ?? firstImage(images);
    if (!image) return null;
    const isDraft = isDraftImage(image);

    return (
      <div className={styles.profilePreview}>
        <DSAvatar
          className={styles.profileAvatar}
          decorative
          size="preview"
          user={{
            displayName: avatarUser?.displayName ?? '',
            profileImage: {
              ...avatarUser?.profileImage,
              [ImageSize.Thumb]: images[ImageSize.Thumb],
              [ImageSize.Banner]: images[ImageSize.Banner],
            },
          }}
        />
        <div className={styles.previewDetails}>
          <DSText.Body as="p" weight="semibold" className={styles.previewTitle}>Profile image</DSText.Body>
          <DSText.Caption className={styles.previewMeta}>
            {isDraft ? 'Ready to save as a 200×200 WebP avatar.' : 'Saved profile avatar.'}
          </DSText.Caption>
          <div className={styles.previewActions}>
            <DSButton onClick={onReplace} label="Replace Image" variant="secondary" />
            <DSButton onClick={onRemove} label="Remove Image" variant="ghost" />
          </div>
        </div>
      </div>
    );
  }

  const entries = Object.entries(images).filter((entry): entry is [string, ImageStorage] => !!entry[1]);

  return (
    <div className={styles.imagePreviewGrid}>
      {entries.map(([key, image]) => (
        <div className={styles.imagePreviewItem} key={key}>
          <StoredImage
            image={image}
            size={{ width: getPreviewWidth(key), height: getPreviewHeight(key) }}
            alt={`${labelForImageKey(key)} preview`}
            className={styles.previewImage}
          />
          <DSText.Caption>{labelForImageKey(key)}</DSText.Caption>
        </div>
      ))}
      <div className={styles.previewActions}>
        <DSButton onClick={onReplace} label="Replace Images" variant="secondary" />
        <DSButton onClick={onRemove} label="Remove Images" variant="ghost" />
      </div>
    </div>
  );
}

function firstImage(images: { [key: string]: ImageStorage | undefined }) {
  return Object.values(images).find(Boolean);
}

function isDraftImage(image: ImageStorage) {
  return !!image.url && !image.path;
}

function revokeDraftUrls(images: { [key: string]: ImageStorage | undefined }) {
  for (const image of Object.values(images) as Array<ImageStorageDraft | undefined>) {
    if (image?.url && !image.path) {
      URL.revokeObjectURL(image.url);
    }
  }
}

function getPreviewWidth(key: string) {
  return isImageSize(key) ? getImageWidth(key) : getImageWidth(ImageSize.Custom);
}

function getPreviewHeight(key: string) {
  return isImageSize(key) ? getImageHeight(key) : getImageHeight(ImageSize.Custom);
}

function isImageSize(key: string): key is ImageSize {
  return (Object.values(ImageSize) as string[]).includes(key);
}

function labelForImageKey(key: string) {
  if (key === ImageSize.CardFull) return 'Full';
  if (key === ImageSize.Card) return 'Card';
  if (key === ImageSize.CardPreview) return 'Preview';
  if (key === ImageSize.Banner) return 'Banner';
  if (key === ImageSize.Thumb) return 'Thumbnail';
  return key;
}
