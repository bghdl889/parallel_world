export function StatusBar({ light = false }: { light?: boolean }) {
  return (
    <div style={{
      height: "max(20px, env(safe-area-inset-top))",
      flexShrink: 0,
    }} />
  );
}
