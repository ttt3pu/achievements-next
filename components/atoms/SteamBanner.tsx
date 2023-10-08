import Image from 'next/image';

type Props = {
  steamId: number;
  className?: string;
};

export default function SteamBanner({ steamId, className = '' }: Props) {
  return (
    <Image
      className={className}
      src={`https://cdn.cloudflare.steamstatic.com/steam/apps/${steamId}/header.jpg`}
      width="460"
      height="215"
      alt=""
    />
  );
}
