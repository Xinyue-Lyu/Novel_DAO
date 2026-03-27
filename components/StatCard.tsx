type StatCardProps = {
  label: string;
  value: string;
  helper?: string;
};

export default function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "16px",
        padding: "20px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "14px",
          color: "#6b7280",
          fontWeight: 600,
        }}
      >
        {label}
      </p>

      <p
        style={{
          marginTop: "10px",
          marginBottom: helper ? "8px" : 0,
          fontSize: "24px",
          fontWeight: 700,
          color: "#111827",
          wordBreak: "break-word",
        }}
      >
        {value}
      </p>

      {helper && (
        <p
          style={{
            margin: 0,
            fontSize: "13px",
            color: "#9ca3af",
            lineHeight: 1.5,
            wordBreak: "break-word",
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}