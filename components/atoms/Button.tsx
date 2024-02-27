import { ReactNode } from 'react';

type Props = {
  to?: string;
  className?: string;
  children: ReactNode;
  onClick: () => void;
};

export default function Button({ to, children, className, onClick }: Props) {
  const CustomTag = to ? 'a' : 'button';

  return (
    <CustomTag
      className={`cursor-pointer radius font-en bg-white text-bg-100 px-4 py-2 inline-flex ${className}`}
      onClick={onClick}
    >
      {children}
    </CustomTag>
  );
}
