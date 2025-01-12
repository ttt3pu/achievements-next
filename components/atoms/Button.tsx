import Link from 'next/link';
import { ReactNode } from 'react';
import { BsPencilSquare } from 'react-icons/bs';
import { BsRocket } from 'react-icons/bs';

type Color = 'yellow' | 'red' | 'blue' | 'orange' | 'white';
type Icon = 'pencil' | 'rocket';

type Props = {
  to?: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
  color?: Color;
  icon?: Icon;
};

export default function Button({ to, children, className, onClick = () => {}, color, icon }: Props) {
  const CustomTag = to ? Link : 'button';

  const colorClasses = (() => {
    switch (color) {
      case 'red':
        return 'bg-red';
      case 'yellow':
        return 'bg-yellow';
      case 'blue':
        return 'bg-blue';
      case 'orange':
        return 'bg-orange';
      case 'white':
        return 'bg-white text-bg-100';
      default:
        return 'bg-bg';
    }
  })();

  const iconTemplate = (() => {
    const iconComponent = (() => {
      switch (icon) {
        case 'pencil':
          return <BsPencilSquare />;
        case 'rocket':
          return <BsRocket />;
        default:
          return '';
      }
    })();

    return <span className="mr-2">{iconComponent}</span>;
  })();

  return (
    <CustomTag
      className={`cursor-pointer radius px-4 py-2 inline-flex items-center font-medium ${colorClasses} ${className}`}
      onClick={onClick}
      href={to}
    >
      {icon && iconTemplate}
      <span>{children}</span>
    </CustomTag>
  );
}
