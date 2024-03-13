import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

type Props = {
  handleChange: Function;
  value: Date;
};

export default function FormDatePicker({ handleChange, value }: Props) {
  return (
    <DatePicker
      selected={value}
      onChange={(date) => handleChange(date)}
      className="text-black py-2 px-4 rounded"
      dateFormat="yyyy-MM-dd"
    />
  );
}
