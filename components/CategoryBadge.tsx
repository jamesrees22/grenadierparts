export default function CategoryBadge({ label }: { label?: string }) {
  if (!label) return null;
  return (
    <span
      className="badge"
      style={{
        fontSize: 12,
        padding: "4px 8px",
        marginLeft: 8,
        textTransform: "capitalize",
      }}
    >
      {label}
    </span>
  );
}
