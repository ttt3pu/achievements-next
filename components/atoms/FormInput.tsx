type Props = {
  handleChange: Function;
  value: string;
  className?: string;
};

export default function FormInput({ handleChange, value, className }: Props) {
  return (
    <input
      value={value}
      type="text"
      className={`px-4 py-2 bg-white rounded text-black ${className}`}
      onChange={(event) => handleChange(event.target.value)}
    />
  );
}
