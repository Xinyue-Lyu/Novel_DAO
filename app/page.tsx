import Link from "next/link";
import Navbar from "@/components/Navbar";
import SectionCard from "@/components/SectionCard";

export default function HomePage() {
  return (
    <main style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />

      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "40px 24px 64px",
        }}
      >
        <section
          style={{
            background:
              "linear-gradient(135deg, #eff6ff 0%, #ffffff 55%, #f9fafb 100%)",
            border: "1px solid #dbeafe",
            borderRadius: "24px",
            padding: "48px 32px",
            marginBottom: "32px",
          }}
        >
          <div style={{ maxWidth: "760px" }}>
            <p
              style={{
                margin: 0,
                color: "#2563eb",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "13px",
              }}
            >
              Decentralized Writing Contest
            </p>

            <h1
              style={{
                marginTop: "14px",
                marginBottom: "16px",
                fontSize: "48px",
                lineHeight: 1.1,
                color: "#111827",
              }}
            >
              Novel DAO Frontend
            </h1>

            <p
              style={{
                marginTop: 0,
                marginBottom: "24px",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#4b5563",
              }}
            >
              A Web3 interface for a novel contest platform where users can buy
              membership, acquire voting tokens, submit stories, vote on
              submissions, and distribute rewards from a shared prize pool.
            </p>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <Link
                href="/dashboard"
                style={{
                  textDecoration: "none",
                  backgroundColor: "#2563eb",
                  color: "#ffffff",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  border: "1px solid #2563eb",
                }}
              >
                Open Dashboard
              </Link>

              <Link
                href="/contest"
                style={{
                  textDecoration: "none",
                  backgroundColor: "#ffffff",
                  color: "#111827",
                  padding: "14px 20px",
                  borderRadius: "12px",
                  fontWeight: 600,
                  border: "1px solid #d1d5db",
                }}
              >
                View Contest Tools
              </Link>
            </div>
          </div>
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
            marginBottom: "32px",
          }}
        >
          {[
            ["Dashboard", "Wallet, token balance, membership status, treasury balance, and contest overview."],
            ["Contest", "Submit novels, load submissions, vote, and inspect winners and top 3 results."],
            ["Treasury", "Purchase membership, buy extra tokens, inspect prize pool, and distribute rewards."],
            ["Admin", "Create contests, end voting, and finalize winners."],
          ].map(([title, text]) => (
            <div
              key={title}
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: "18px",
                padding: "22px",
              }}
            >
              <h3 style={{ marginTop: 0, marginBottom: "8px" }}>{title}</h3>
              <p style={{ margin: 0, color: "#6b7280", lineHeight: 1.6 }}>{text}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "20px",
          }}
        >
          <SectionCard
            title="How the platform works"
            description="Main user workflow"
          >
            <ol style={{ margin: 0, paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>Connect MetaMask on Sepolia.</li>
              <li>Buy membership for a contest.</li>
              <li>Buy extra voting tokens if needed.</li>
              <li>Submit a novel to an active contest.</li>
              <li>Vote on submissions and finalize the contest lifecycle.</li>
            </ol>
          </SectionCard>

          <SectionCard
            title="Presentation flow"
            description="Recommended live demo order"
          >
            <ol style={{ margin: 0, paddingLeft: "20px", color: "#374151", lineHeight: 1.8 }}>
              <li>Homepage overview</li>
              <li>Dashboard connection and status</li>
              <li>Treasury purchase flow</li>
              <li>Contest submission and voting flow</li>
              <li>Admin finalization and reward distribution</li>
            </ol>
          </SectionCard>
        </div>
      </div>
    </main>
  );
}