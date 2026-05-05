export function formatComandaNumber(id) {
  return `COM-${String(id).padStart(3, '0')}`;
}
