"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SectionCard from "@/components/SectionCard";
import StatCard from "@/components/StatCard";
import {
  getMembershipPrice,
  getMembershipStatus,
  getNextContestId,
  getTokenInfo,
  getTreasuryBalance,
} from "@/lib/contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function DashboardPage() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("--");
  const [tokenSymbol, setTokenSymbol] = useState<string>("");
  const [totalSupply, setTotalSupply] = useState<string>("--");
  const [maxSupply, setMaxSupply] = useState<string>("--");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [nextContestId, setNextContestId] = useState<string>("--");
  const [treasuryBalanceEth, setTreasuryBalanceEth] = useState<string>("--");
  const [treasuryBalanceWei, setTreasuryBalanceWei] = useState<string>("--");
  const [membershipPriceEth, setMembershipPriceEth] = useState<string>("--");
  const [membershipPriceWei, setMembershipPriceWei] = useState<string>("--");
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function connectWallet() {
    try {
      setError("");
      setStatus("Connecting wallet and loading dashboard...");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        setStatus("");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (!accounts.length) {
        setError("No wallet account found.");
        setStatus("");
        return;
      }

      const user = accounts[0];
      setAccount(user);

      try {
        const tokenInfo = await getTokenInfo(user);
        setBalance(tokenInfo.balanceFormatted);
        setTokenSymbol(tokenInfo.symbol);
        setTotalSupply(tokenInfo.totalSupply);
        setMaxSupply(tokenInfo.maxSupply);
      } catch (err) {
        console.error("getTokenInfo failed:", err);
        setBalance("Error");
      }

      try {
        const membership = await getMembershipStatus(user);
        setIsMember(membership);
      } catch (err) {
        console.error("getMembershipStatus failed:", err);
        setIsMember(null);
      }

      try {
        const contestId = await getNextContestId();
        setNextContestId(contestId);
      } catch (err) {
        console.error("getNextContestId failed:", err);
        setNextContestId("Error");
      }

      try {
        const treasury = await getTreasuryBalance();
        setTreasuryBalanceEth(treasury.ethFormatted);
        setTreasuryBalanceWei(treasury.wei);
      } catch (err) {
        console.error("getTreasuryBalance failed:", err);
        setTreasuryBalanceEth("Error");
        setTreasuryBalanceWei("Error");
      }

      try {
        const membershipPrice = await getMembershipPrice();
        setMembershipPriceEth(membershipPrice.ethFormatted);
        setMembershipPriceWei(membershipPrice.wei);
      } catch (err) {
        console.error("getMembershipPrice failed:", err);
        setMembershipPriceEth("Error");
        setMembershipPriceWei("Error");
      }

      setStatus("Dashboard loaded.");
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
      setStatus("");
    }
  }

  return (
    <main style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "13px" }}>
            Overview
          </p>
          <h1 style={{ marginTop: "10px", marginBottom: "10px", fontSize: "40px", color: "#111827" }}>
            Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", lineHeight: 1.7, maxWidth: "760px" }}>
            View wallet connection status, token balance, membership access, treasury balance,
            membership price, and contest identifiers.
          </p>
        </div>

        <SectionCard title="Wallet Connection" description="Connect MetaMask on Sepolia to load dashboard data.">
          <button onClick={connectWallet} style={primaryButton}>Connect MetaMask</button>

          {status && <p style={{ marginTop: "16px", color: "#374151" }}>{status}</p>}
          {error && <p style={{ marginTop: "16px", color: "#dc2626" }}>{error}</p>}

          {account && (
            <div style={panelStyle}>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>
                Connected Address
              </p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "#111827", wordBreak: "break-word" }}>
                {account}
              </p>
            </div>
          )}
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "18px", marginTop: "24px" }}>
          <StatCard label="Token Balance" value={balance === "--" ? "--" : `${balance} ${tokenSymbol}`} />
          <StatCard
            label="Membership Status"
            value={isMember === null ? "Unavailable" : isMember ? "Member" : "Not a member"}
            helper="If unavailable, the live deployment may differ from the document."
          />
          <StatCard label="Next Contest ID" value={nextContestId} helper="Existing contest IDs may be smaller, such as 0." />
          <StatCard label="Treasury Balance" value={treasuryBalanceEth === "--" ? "--" : `${treasuryBalanceEth} ETH`} helper={`Raw wei: ${treasuryBalanceWei}`} />
          <StatCard label="Membership Price" value={membershipPriceEth === "--" ? "--" : `${membershipPriceEth} ETH`} helper={`Raw wei: ${membershipPriceWei}`} />
          <StatCard label="Token Supply" value={`${totalSupply} / ${maxSupply} ${tokenSymbol}`} />
        </div>
      </div>
    </main>
  );
}

const primaryButton: React.CSSProperties = {
  padding: "12px 20px",
  fontSize: "16px",
  cursor: "pointer",
  borderRadius: "12px",
  border: "1px solid #2563eb",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
};

const panelStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};