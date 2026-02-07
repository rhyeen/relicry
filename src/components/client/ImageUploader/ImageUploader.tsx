'use client';

import { getImageHeight, getImageQuality, getImageWidth, ImageSize, ImageStorage } from '@/entities/Image';
import DSField from '@/components/ds/DSField';
import ImageUploadDragDrop from './ImageUploadDragDrop';
import StoredImage from '../StoredImage';
import DSButton from '@/components/ds/DSButton';
import { useMemo, useState } from 'react';

type ImageUploaderProps = {
  label?: string;
  description?: string;
  images: { [key: string]: ImageStorage | undefined; };
  onChange: (images: { [key: string]: ImageStorage | undefined; }) => void;
  required?: boolean;
  type: 'illustration' | 'promotedItem';
};

export default function ImageUploader({ label, description, images, onChange, required, type }: ImageUploaderProps) {
  const [error, setError] = useState('');
  const hasImage = Object.values(images).some(image => image !== undefined);

  const sizes = useMemo(() => {
    const _sizes: { [key: string]: { width: number; height: number, quality: number } } = {};
    if (type === 'illustration') {
      _sizes[ImageSize.CardFull] = {
        width: getImageWidth(ImageSize.CardFull),
        height: getImageHeight(ImageSize.CardFull),
        quality: getImageQuality(ImageSize.CardFull),
      };
      _sizes[ImageSize.Card] = {
        width: getImageWidth(ImageSize.Card),
        height: getImageHeight(ImageSize.Card),
        quality: getImageQuality(ImageSize.Card),
      };
      _sizes[ImageSize.CardPreview] = {
        width: getImageWidth(ImageSize.CardPreview),
        height: getImageHeight(ImageSize.CardPreview),
        quality: getImageQuality(ImageSize.CardPreview),
      };
    } else if (type === 'promotedItem') {
      _sizes[ImageSize.Banner] = {
        width: getImageWidth(ImageSize.Banner),
        height: getImageHeight(ImageSize.Banner),
        quality: getImageQuality(ImageSize.Banner),
      };
      _sizes[ImageSize.Thumb] = {
        width: getImageWidth(ImageSize.Thumb),
        height: getImageHeight(ImageSize.Thumb),
        quality: getImageQuality(ImageSize.Thumb),
      };
    }
    return _sizes;
  }, [type]);

  return (
    <>
      {(label || description) &&
        <DSField.Root>
          {label && <DSField.Label label={label || 'Upload Image'} required={required} />}
          <DSField.Description description={description} />
          { hasImage ? 
            <div>
              {Object.entries(images).map(([key, image]) => (
                image ? 
                  <StoredImage
                    key={key}
                    image={image}
                    size={{ width: getImageWidth(key as ImageSize), height: getImageHeight(key as ImageSize) }}
                  /> : null
              ))}
              <DSButton onClick={() => onChange({})} label="Remove Images" />
            </div>
            :
            <ImageUploadDragDrop
              onChange={onChange}
              sizes={sizes}
              onError={setError}
            />
          }
          <DSField.Error error={error} />
        </DSField.Root>
      }
    </>
  );
}