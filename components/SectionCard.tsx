import { ReactNode } from "react";

type SectionCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
};

export default function SectionCard({
  title,
  description,
  children,
}: SectionCardProps) {
  return (
    <section
      style={{
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "18px",
        padding: "24px",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
      }}
    >
      <div style={{ marginBottom: "18px" }}>
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: 700,
            color: "#111827",
          }}
        >
          {title}
        </h2>

        {description && (
          <p
            style={{
              marginTop: "8px",
              marginBottom: 0,
              fontSize: "15px",
              color: "#6b7280",
              lineHeight: 1.6,
            }}
          >
            {description}
          </p>
        )}
      </div>

      {children}
    </section>
  );
}