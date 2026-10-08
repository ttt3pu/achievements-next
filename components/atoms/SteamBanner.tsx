import Image from 'next/image';
import { useState } from 'react';
import { validSteamImageUrl } from 'utils/steamImage';

type Props = {
  imageUrl?: string | null;
  className?: string;
};

export default function SteamBanner({ imageUrl, className = '' }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const src = validSteamImageUrl(imageUrl);
  if (!src || failedUrl === src) {
    return <div className={`flex items-center justify-center bg-bg-300 aspect-[460/215] ${className}`}>画像なし</div>;
  }
  return <Image className={className} src={src} width={460} height={215} alt="" onError={() => setFailedUrl(src)} />;
}
