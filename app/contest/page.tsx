"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SectionCard from "@/components/SectionCard";
import {
  getContestInfo,
  getNextContestId,
  getSubmissionsByContest,
  getTop3,
  getWinner,
  submitNovel,
  voteForSubmission,
  Submission,
  WinnerInfo,
} from "@/lib/contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ContestPage() {
  const [account, setAccount] = useState<string>("");
  const [nextContestId, setNextContestId] = useState<string>("");
  const [contestStatus, setContestStatus] = useState<string>("");

  const [contestIdInput, setContestIdInput] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [contentURI, setContentURI] = useState<string>("");
  const [submitMessage, setSubmitMessage] = useState<string>("");

  const [viewContestId, setViewContestId] = useState<string>("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadMessage, setLoadMessage] = useState<string>("");

  const [voteContestId, setVoteContestId] = useState<string>("");
  const [voteSubmissionId, setVoteSubmissionId] = useState<string>("");
  const [voteAmount, setVoteAmount] = useState<string>("");
  const [voteMessage, setVoteMessage] = useState<string>("");

  const [winnerContestId, setWinnerContestId] = useState<string>("");
  const [winnerResult, setWinnerResult] = useState<WinnerInfo | null>(null);
  const [winnerMessage, setWinnerMessage] = useState<string>("");

  const [top3Ids, setTop3Ids] = useState<string[]>([]);
  const [top3Authors, setTop3Authors] = useState<string[]>([]);

  const [error, setError] = useState<string>("");
  const [status, setStatus] = useState<string>("");

  async function connectWallet() {
    try {
      setError("");
      setStatus("Connecting wallet...");

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

        if (!contestIdInput) setContestIdInput(latestExisting);
        if (!viewContestId) setViewContestId(latestExisting);
        if (!voteContestId) setVoteContestId(latestExisting);
        if (!winnerContestId) setWinnerContestId(latestExisting);
      } catch (err) {
        console.error("getNextContestId failed:", err);
      }

      setStatus("Wallet connected.");
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
      setStatus("");
    }
  }

  async function handleSubmitNovel() {
    try {
      setSubmitMessage("");
      setError("");

      if (!account) {
        setSubmitMessage("Please connect your wallet first.");
        return;
      }
      if (!contestIdInput || !title || !contentURI) {
        setSubmitMessage("Please fill in Contest ID, Title, and Content URI.");
        return;
      }

      setSubmitMessage("Submitting... Please confirm in MetaMask.");
      const tx = await submitNovel(contestIdInput, title, contentURI);
      await tx.wait();

      setSubmitMessage("✅ Submission successful!");
      setTitle("");
      setContentURI("");
    } catch (err: any) {
      setSubmitMessage("❌ " + (err.reason || err.message || "Transaction failed"));
    }
  }

  async function handleLoadSubmissions() {
    try {
      setLoadMessage("");
      setContestStatus("");
      setError("");

      if (!viewContestId) {
        setLoadMessage("Please enter a contest ID.");
        return;
      }

      const [contest, result] = await Promise.all([
        getContestInfo(viewContestId),
        getSubmissionsByContest(viewContestId),
      ]);

      setSubmissions(result);
      setContestStatus(
        contest.exists
          ? `Contest "${contest.name}" | active=${contest.active} | finalized=${contest.winnerFinalized} | submissions=${contest.submissionCount}`
          : "Contest does not exist."
      );

      if (result.length === 0) {
        setLoadMessage("No submissions found for this contest.");
      } else {
        setLoadMessage(`Loaded ${result.length} submission(s).`);
      }
    } catch (err: any) {
      setLoadMessage("❌ " + (err.reason || err.message || "Failed to load submissions"));
    }
  }

  async function handleVote() {
    try {
      setVoteMessage("");
      setError("");

      if (!account) {
        setVoteMessage("Please connect your wallet first.");
        return;
      }
      if (!voteContestId || !voteSubmissionId || !voteAmount) {
        setVoteMessage("Please fill in Contest ID, Submission ID, and Vote Amount.");
        return;
      }
      if (Number(voteAmount) <= 0) {
        setVoteMessage("Vote amount must be greater than 0.");
        return;
      }

      setVoteMessage("Submitting vote... Please confirm in MetaMask.");
      const tx = await voteForSubmission(voteContestId, voteSubmissionId, voteAmount);
      await tx.wait();

      setVoteMessage("✅ Vote successful!");

      if (viewContestId === voteContestId) {
        const refreshed = await getSubmissionsByContest(viewContestId);
        setSubmissions(refreshed);
      }
    } catch (err: any) {
      setVoteMessage("❌ " + (err.reason || err.message || "Vote failed"));
    }
  }

  async function handleGetWinner() {
    try {
      setWinnerMessage("");
      setWinnerResult(null);
      setTop3Ids([]);
      setTop3Authors([]);
      setError("");

      if (!winnerContestId) {
        setWinnerMessage("Please enter a contest ID.");
        return;
      }

      const [winner, top3] = await Promise.all([
        getWinner(winnerContestId),
        getTop3(winnerContestId),
      ]);

      setWinnerResult(winner);
      setTop3Ids(top3.submissionIds);
      setTop3Authors(top3.authors);

      if (!winner.exists) {
        setWinnerMessage("No finalized winner found for this contest.");
      }
    } catch (err: any) {
      setWinnerMessage("❌ " + (err.reason || err.message || "Failed to get winner"));
    }
  }

  return (
    <main style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "13px" }}>
            Participation
          </p>
          <h1 style={{ marginTop: "10px", marginBottom: "10px", fontSize: "40px", color: "#111827" }}>
            Contest
          </h1>
          <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", lineHeight: 1.7, maxWidth: "760px" }}>
            Submit novels, explore submissions, vote on entries, and inspect the winning and top 3 submissions.
          </p>
        </div>

        <SectionCard title="Wallet Connection" description="Connect MetaMask before submitting or voting.">
          <button
            onClick={connectWallet}
            style={{
              padding: "12px 20px",
              fontSize: "16px",
              cursor: "pointer",
              borderRadius: "12px",
              border: "1px solid #2563eb",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              fontWeight: 600,
            }}
          >
            Connect MetaMask
          </button>

          {status && <p style={{ marginTop: "16px", color: "#374151" }}>{status}</p>}
          {error && <p style={{ marginTop: "16px", color: "#dc2626" }}>{error}</p>}

          {account && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                backgroundColor: "#f9fafb",
                border: "1px solid #e5e7eb",
                borderRadius: "14px",
              }}
            >
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>Connected Address</p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "#111827", wordBreak: "break-word" }}>{account}</p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "#6b7280" }}>Next Contest ID: {nextContestId || "--"}</p>
            </div>
          )}
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "24px" }}>
          <SectionCard title="Submit Novel" description="Submit a story to the selected contest.">
            <input type="text" placeholder="Contest ID" value={contestIdInput} onChange={(e) => setContestIdInput(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Content URI" value={contentURI} onChange={(e) => setContentURI(e.target.value)} style={inputStyle} />
            <button onClick={handleSubmitNovel} style={primaryButton}>Submit Novel</button>
            {submitMessage && <p style={{ marginTop: "12px" }}>{submitMessage}</p>}
          </SectionCard>

          <SectionCard title="Vote for Submission" description="Vote using your token amount.">
            <input type="text" placeholder="Contest ID" value={voteContestId} onChange={(e) => setVoteContestId(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Submission ID" value={voteSubmissionId} onChange={(e) => setVoteSubmissionId(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Vote Amount" value={voteAmount} onChange={(e) => setVoteAmount(e.target.value)} style={inputStyle} />
            <button onClick={handleVote} style={primaryButton}>Vote</button>
            {voteMessage && <p style={{ marginTop: "12px" }}>{voteMessage}</p>}
          </SectionCard>
        </div>

        <div style={{ marginTop: "24px" }}>
          <SectionCard title="View Submissions" description="Load all visible submissions for a selected contest.">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              <input type="text" placeholder="Contest ID" value={viewContestId} onChange={(e) => setViewContestId(e.target.value)} style={{ ...inputStyle, flex: "1 1 240px", marginBottom: 0 }} />
              <button onClick={handleLoadSubmissions} style={primaryButton}>Load Submissions</button>
            </div>

            {contestStatus && <p style={{ marginTop: 0, color: "#374151" }}>{contestStatus}</p>}
            {loadMessage && <p style={{ marginTop: 0 }}>{loadMessage}</p>}

            {submissions.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
                {submissions.map((item) => (
                  <div key={item.submissionId} style={panelStyle}>
                    <p><strong>Submission ID:</strong> {item.submissionId}</p>
                    <p><strong>Title:</strong> {item.title || "(empty)"}</p>
                    <p><strong>Author:</strong> {item.author}</p>
                    <p><strong>Vote Count:</strong> {item.voteCount}</p>
                    <p style={{ wordBreak: "break-word" }}><strong>Content URI:</strong> {item.contentURI || "(empty)"}</p>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>

        <div style={{ marginTop: "24px" }}>
          <SectionCard title="Get Winner and Top 3" description="Load the finalized winner and top 3 ranking.">
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
              <input type="text" placeholder="Contest ID" value={winnerContestId} onChange={(e) => setWinnerContestId(e.target.value)} style={{ ...inputStyle, flex: "1 1 240px", marginBottom: 0 }} />
              <button onClick={handleGetWinner} style={primaryButton}>Load Results</button>
            </div>

            {winnerMessage && <p>{winnerMessage}</p>}

            {winnerResult && winnerResult.exists && (
              <div style={panelStyle}>
                <p><strong>Winner Title:</strong> {winnerResult.title || "(empty)"}</p>
                <p><strong>Winner Author:</strong> {winnerResult.author}</p>
                <p><strong>Winner Vote Count:</strong> {winnerResult.voteCount}</p>
                <p style={{ wordBreak: "break-word" }}><strong>Winner Content URI:</strong> {winnerResult.contentURI || "(empty)"}</p>
              </div>
            )}

            {(top3Ids.length > 0 || top3Authors.length > 0) && (
              <div style={{ marginTop: "16px" }}>
                <p><strong>Top 3 Submission IDs:</strong> {top3Ids.join(", ")}</p>
                <p style={{ wordBreak: "break-word" }}><strong>Top 3 Authors:</strong> {top3Authors.join(", ")}</p>
              </div>
            )}
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

const panelStyle: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: "14px",
  padding: "16px",
  backgroundColor: "#f9fafb",
};