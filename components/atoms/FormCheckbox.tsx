type Props = {
  handleChange: (checked: boolean) => void;
  value: boolean;
};

export default function FormCheckbox({ handleChange, value }: Props) {
  return (
    <input
      checked={value}
      type="checkbox"
      className="rounded"
      onChange={(event) => handleChange(event.target.checked)}
    />
  );
}
