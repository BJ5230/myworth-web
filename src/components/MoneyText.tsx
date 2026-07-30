import { formatMYR } from '../utils/format';

interface MoneyTextProps {
  value: number;
  hidden?: boolean;
}

export function MoneyText({ value, hidden }: MoneyTextProps) {
  return <>{hidden ? '****' : formatMYR(value)}</>;
}
