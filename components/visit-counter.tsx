type Props = { today: number; total: number };

export function VisitCounter({ today, total }: Props) {
  return (
    <p className="text-base font-semibold text-muted-foreground">
      Today {today}&nbsp;&nbsp;Total {total}
    </p>
  );
}
