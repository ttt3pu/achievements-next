import DatePicker from 'react-datepicker';

type Props = {
  handleChange: (date: Date) => void;
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
