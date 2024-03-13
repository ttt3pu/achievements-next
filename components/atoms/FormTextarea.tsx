type Props = {
  handleChange: Function;
  value: string;
  className?: string;
};

export default function FormTextarea({ handleChange, value, className }: Props) {
  return (
    <textarea
      value={value}
      className={`px-4 py-2 bg-white rounded text-black h-96 ${className}`}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
}
