import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
}

export default function HeadingLv2({ children }: Props) {
  return (
    <h2>{children}</h2>
  );
}
