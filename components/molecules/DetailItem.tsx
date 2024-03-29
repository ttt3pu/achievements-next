import { ReactNode } from 'react';
import styles from 'components/molecules/Detailitem.module.scss';
import { BiSolidCalendarCheck } from 'react-icons/bi';
import { BiSolidCalendarEdit } from 'react-icons/bi';
import { FaClock } from 'react-icons/fa6';
import { CgSandClock } from 'react-icons/cg';

type Props = {
  title: string;
  children: ReactNode;
  icon?: 'calendar-check' | 'calendar-edit' | 'clock' | 'sand-clock';
};

export default function Box({ title, children, icon }: Props) {
  const CustomTag = (() => {
    switch (icon) {
      case 'calendar-check':
        return BiSolidCalendarCheck;
      case 'calendar-edit':
        return BiSolidCalendarEdit;
      case 'clock':
        return FaClock;
      case 'sand-clock':
        return CgSandClock;
    }
  })();

  return (
    <div className={`${styles.detailItem} flex items-center text-sm mb-3`}>
      {icon && <CustomTag size="1.5em" className="mr-3" />}
      <div className="mr-3 font-medium">{title}:</div>
      <div className="text-yellow">{children}</div>
    </div>
  );
}
