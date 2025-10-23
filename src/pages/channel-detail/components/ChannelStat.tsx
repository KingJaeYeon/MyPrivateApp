export default function ChannelStat({
  value,
  label,
  seq = 0,
}: {
  value: string;
  label: string;
  seq?: 0 | 1;
}) {
  return (
    <p className={'flex gap-1'}>
      {seq === 0 && label}
      <span className={'font-semibold'}>{value}</span>
      {seq === 1 && label}
    </p>
  );
}
