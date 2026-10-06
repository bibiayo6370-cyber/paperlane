export function formatMoney(minor: number, currency: string): string {
  const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency });
  const digits = fmt.resolvedOptions().maximumFractionDigits ?? 2;
  return fmt.format(minor / 10 ** digits);
}
