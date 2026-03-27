"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SectionCard from "@/components/SectionCard";
import {
  createContest,
  endVoting,
  finalizeWinner,
  getNextContestId,
} from "@/lib/contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function AdminPage() {
  const [account, setAccount] = useState<string>("");
  const [nextContestId, setNextContestId] = useState<string>("--");

  const [contestName, setContestName] = useState<string>("");
  const [submissionDeadline, setSubmissionDeadline] = useState<string>("");
  const [createMessage, setCreateMessage] = useState<string>("");

  const [manageContestId, setManageContestId] = useState<string>("");
  const [manageMessage, setManageMessage] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function connectWallet() {
    try {
      setError("");
      setStatus("Connecting wallet and loading admin tools...");

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
        const contestId = await getNextContestId();
        setNextContestId(contestId);
        const numericContestId = Number(contestId);
        const latestExisting = numericContestId > 0 ? String(numericContestId - 1) : "0";
        if (!manageContestId) setManageContestId(latestExisting);
      } catch (err) {
        console.error("getNextContestId failed:", err);
        setNextContestId("Error");
      }

      setStatus("Admin page loaded.");
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
      setStatus("");
    }
  }

  async function handleCreateContest() {
    try {
      setCreateMessage("");
      if (!account) return setCreateMessage("Please connect your wallet first.");
      if (!contestName || !submissionDeadline) {
        return setCreateMessage("Please fill in Contest Name and Submission Deadline.");
      }

      setCreateMessage("Creating contest... Please confirm in MetaMask.");
      const tx = await createContest(contestName, submissionDeadline);
      await tx.wait();

      setCreateMessage("✅ Contest created successfully!");
      setContestName("");
      setSubmissionDeadline("");

      const contestId = await getNextContestId();
      setNextContestId(contestId);
    } catch (err: any) {
      setCreateMessage("❌ " + (err.reason || err.message || "Create contest failed"));
    }
  }

  async function handleEndVoting() {
    try {
      setManageMessage("");
      if (!account) return setManageMessage("Please connect your wallet first.");
      if (!manageContestId) return setManageMessage("Please enter a contest ID.");

      setManageMessage("Ending voting... Please confirm in MetaMask.");
      const tx = await endVoting(manageContestId);
      await tx.wait();

      setManageMessage("✅ Voting ended successfully!");
    } catch (err: any) {
      setManageMessage("❌ " + (err.reason || err.message || "End voting failed"));
    }
  }

  async function handleFinalizeWinner() {
    try {
      setManageMessage("");
      if (!account) return setManageMessage("Please connect your wallet first.");
      if (!manageContestId) return setManageMessage("Please enter a contest ID.");

      setManageMessage("Finalizing winner... Please confirm in MetaMask.");
      const tx = await finalizeWinner(manageContestId);
      await tx.wait();

      setManageMessage("✅ Winner finalized successfully!");
    } catch (err: any) {
      setManageMessage("❌ " + (err.reason || err.message || "Finalize winner failed"));
    }
  }

  return (
    <main style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "13px" }}>
            Management
          </p>
          <h1 style={{ marginTop: "10px", marginBottom: "10px", fontSize: "40px", color: "#111827" }}>
            Admin
          </h1>
          <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", lineHeight: 1.7, maxWidth: "760px" }}>
            Create contests, end voting windows, and finalize winning submissions.
          </p>
        </div>

        <SectionCard title="Wallet Connection" description="Connect MetaMask to use admin actions.">
          <button onClick={connectWallet} style={primaryButton}>Connect MetaMask</button>
          {status && <p style={{ marginTop: "16px", color: "#374151" }}>{status}</p>}
          {error && <p style={{ marginTop: "16px", color: "#dc2626" }}>{error}</p>}

          {account && (
            <div style={panelStyle}>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>Connected Address</p>
              <p style={{ marginTop: "8px", marginBottom: "8px", color: "#111827", wordBreak: "break-word" }}>{account}</p>
              <p style={{ margin: 0, color: "#6b7280" }}>Next Contest ID: {nextContestId}</p>
            </div>
          )}
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "24px" }}>
          <SectionCard title="Create Contest" description="Create a new contest with a name and submission deadline.">
            <input type="text" placeholder="Contest Name" value={contestName} onChange={(e) => setContestName(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Submission Deadline (timestamp)" value={submissionDeadline} onChange={(e) => setSubmissionDeadline(e.target.value)} style={inputStyle} />
            <button onClick={handleCreateContest} style={primaryButton}>Create Contest</button>
            {createMessage && <p style={{ marginTop: "12px" }}>{createMessage}</p>}
          </SectionCard>

          <SectionCard title="Contest Management" description="End voting and finalize winners using a contest ID.">
            <input type="text" placeholder="Contest ID" value={manageContestId} onChange={(e) => setManageContestId(e.target.value)} style={inputStyle} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleEndVoting} style={secondaryButton}>End Voting</button>
              <button onClick={handleFinalizeWinner} style={primaryButton}>Finalize Winner</button>
            </div>

            {manageMessage && <p style={{ marginTop: "12px" }}>{manageMessage}</p>}
          </SectionCard>
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  marginBottom: "10px",
  padding: "10px",
  width: "100%",
  borderRadius: "10px",
  border: "1px solid #d1d5db",
};

const primaryButton: React.CSSProperties = {
  padding: "10px 18px",
  fontSize: "15px",
  cursor: "pointer",
  borderRadius: "10px",
  border: "1px solid #2563eb",
  backgroundColor: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
};

const secondaryButton: React.CSSProperties = {
  ...primaryButton,
  backgroundColor: "#ffffff",
  color: "#2563eb",
};

const panelStyle: React.CSSProperties = {
  marginTop: "18px",
  padding: "16px",
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
};