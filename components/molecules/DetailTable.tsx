type Props = {
  items: {
    heading: string;
    text: string;
  }[];
};

export default function Box({ items }: Props) {
  return (
    <div>
      {items.map((item, i) => {
        const { heading, text } = item;
        return (
          <dl key={i} className="flex content-between">
            <dt className="font-medium mr-5">{heading}</dt>
            <dd>{text}</dd>
          </dl>
        );
      })}
    </div>
  );
}
