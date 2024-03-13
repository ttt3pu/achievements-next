import { ReactNode } from 'react';

type Color = 'yellow';

type Props = {
  to?: string;
  className?: string;
  children: ReactNode;
  onClick: () => void;
  color?: Color;
};

export default function Button({ to, children, className, onClick, color }: Props) {
  const CustomTag = to ? 'a' : 'button';

  const colorClasses = (() => {
    switch (color) {
      case 'yellow':
        return 'bg-yellow';
      default:
        return 'bg-white text-bg-100';
    }
  })();

  return (
    <CustomTag
      className={`cursor-pointer radius px-4 py-2 inline-flex font-medium ${colorClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </CustomTag>
  );
}
