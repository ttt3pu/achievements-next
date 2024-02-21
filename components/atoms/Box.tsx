import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export default function Box({ children }: Props) {
  return <div className="shadow px-5 py-10 bg-bg-200">{children}</div>;
}
