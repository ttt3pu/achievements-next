type Props = {
  handleChange: Function;
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
