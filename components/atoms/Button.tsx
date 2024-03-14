import Link from 'next/link';
import { ReactNode } from 'react';
import { BsPencilSquare } from 'react-icons/bs';

type Color = 'yellow' | 'red';

type Props = {
  to?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  color?: Color;
  icon?: 'pencil';
};

export default function Button({ to, children, className, onClick = () => {}, color, icon }: Props) {
  const CustomTag = to ? Link : 'button';

  const colorClasses = (() => {
    switch (color) {
      case 'red':
        return 'bg-red';
      case 'yellow':
        return 'bg-yellow';
      default:
        return 'bg-white text-bg-100';
    }
  })();

  return (
    <CustomTag
      className={`cursor-pointer radius px-4 py-2 inline-flex items-center font-medium ${colorClasses} ${className}`}
      onClick={onClick}
      href={to}
    >
      {icon && (
        <span className="mr-2">
          <BsPencilSquare />
        </span>
      )}
      <span>{children}</span>
    </CustomTag>
  );
}
