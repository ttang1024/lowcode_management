/**
 * @module gw-image
 * @description Image component that resolves OSS keys to URLs.
 *   `errorContent` replaces the image when it fails to load (`fallback`, an
 *   alternate image URL, still passes through to the kit `Image`).
 */
import React, { useEffect, useState } from 'react';
import { Image } from 'lowcode-kit';
import { Oss } from 'lowcode-common';
import type { GwImageProps } from '../interface';

export type { GwImageProps };

const GwImage: React.FC<GwImageProps & { errorContent?: React.ReactNode }> = ({ src, errorContent, ...rest }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);

  const url = src ? Oss.getUrl(src) : undefined;
  if (failed && errorContent !== undefined) return <>{errorContent}</>;
  const onError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setFailed(true);
    rest.onError?.(e);
  };
  return <Image src={url} {...rest} onError={onError} />;
};

export default GwImage;
