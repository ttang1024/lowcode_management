import React, { useEffect, useState } from 'react';
import { Avatar, type AvatarProps } from 'lowcode-kit';

export interface UserAvatarProps extends AvatarProps {
  /** Image used when `src` fails to load. */
  fallback?: string
}

export default function UserAvatar({ fallback, ...props }: UserAvatarProps) {
  const [src, setSrc] = useState(props.src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setSrc(props.src);
    setFailed(false);
  }, [props.src]);

  // Probe the image so a broken `src` can switch to the fallback.
  useEffect(() => {
    if (!src || !fallback || failed) return;
    const img = new window.Image();
    img.onerror = () => {
      setFailed(true);
      setSrc(fallback);
    };
    img.src = src;
  }, [src, fallback, failed]);

  return <Avatar {...props} src={src} />;
}
