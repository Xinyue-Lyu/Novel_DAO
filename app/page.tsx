"use client";

import { useState } from "react";
import {
  buyExtraTokens,
  createContest,
  distributeReward,
  endVoting,
  finalizeWinner,
  getContestPrizePool,
  getMembershipPriceInWei,
  getMembershipStatus,
  getNextContestId,
  getSubmissionsByContest,
  getTokenBalance,
  getTokenPriceInWei,
  getTreasuryBalance,
  getUserRole,
  getWinner,
  purchaseMembership,
  submitNovel,
  voteForSubmission,
  Submission,
} from "@/lib/contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function HomePage() {
  const [account, setAccount] = useState<string>("");
  const [balance, setBalance] = useState<string>("");
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [role, setRole] = useState<string>("");
  const [nextContestId, setNextContestId] = useState<string>("");
  const [error, setError] = useState<string>("");

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

  const [contestName, setContestName] = useState<string>("");
  const [submissionDeadline, setSubmissionDeadline] = useState<string>("");
  const [votingDuration, setVotingDuration] = useState<string>("");
  const [adminMessage, setAdminMessage] = useState<string>("");

  const [manageContestId, setManageContestId] = useState<string>("");
  const [manageMessage, setManageMessage] = useState<string>("");

  const [winnerContestId, setWinnerContestId] = useState<string>("");
  const [winnerResult, setWinnerResult] = useState<string>("");

  const [membershipContestId, setMembershipContestId] = useState<string>("");
  const [membershipPrice, setMembershipPrice] = useState<string>("");
  const [membershipMessage, setMembershipMessage] = useState<string>("");

  const [tokenBuyContestId, setTokenBuyContestId] = useState<string>("");
  const [tokenBuyAmount, setTokenBuyAmount] = useState<string>("1");
  const [tokenPrice, setTokenPrice] = useState<string>("");
  const [tokenBuyMessage, setTokenBuyMessage] = useState<string>("");

  const [treasuryBalance, setTreasuryBalance] = useState<string>("");
  const [poolContestId, setPoolContestId] = useState<string>("");
  const [contestPool, setContestPool] = useState<string>("");
  const [treasuryMessage, setTreasuryMessage] = useState<string>("");

  async function refreshDashboard(user: string) {
    const [
      tokenBalance,
      membership,
      userRole,
      contestId,
      membershipWei,
      treasuryWei,
    ] = await Promise.all([
      getTokenBalance(user),
      getMembershipStatus(user),
      getUserRole(user),
      getNextContestId(),
      getMembershipPriceInWei(),
      getTreasuryBalance(),
    ]);

    setBalance(tokenBalance);
    setIsMember(membership);
    setRole(userRole);
    setNextContestId(contestId);
    setMembershipPrice(membershipWei);
    setTreasuryBalance(treasuryWei);

    const numericContestId = Number(contestId);
    const latestExisting = numericContestId > 0 ? String(numericContestId - 1) : "0";

    if (!viewContestId) setViewContestId(latestExisting);
    if (!voteContestId) setVoteContestId(latestExisting);
    if (!contestIdInput) setContestIdInput(latestExisting);
    if (!manageContestId) setManageContestId(latestExisting);
    if (!winnerContestId) setWinnerContestId(latestExisting);
    if (!membershipContestId) setMembershipContestId(latestExisting);
    if (!tokenBuyContestId) setTokenBuyContestId(latestExisting);
    if (!poolContestId) setPoolContestId(latestExisting);

    if (!tokenPrice) {
      const initialTokenPrice = await getTokenPriceInWei("1");
      setTokenPrice(initialTokenPrice);
    }
  }

  async function connectWallet() {
    try {
      setError("");

      if (!window.ethereum) {
        setError("MetaMask is not installed.");
        return;
      }

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts.length > 0) {
        const user = accounts[0];
        setAccount(user);
        await refreshDashboard(user);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
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
      setError("");

      if (!viewContestId) {
        setLoadMessage("Please enter a contest ID.");
        return;
      }

      setLoadMessage("Loading submissions...");
      const result = await getSubmissionsByContest(viewContestId);
      setSubmissions(result);

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

  async function handleCreateContest() {
    try {
      setAdminMessage("");
      setError("");

      if (!account) {
        setAdminMessage("Please connect your wallet first.");
        return;
      }

      if (!contestName || !submissionDeadline || !votingDuration) {
        setAdminMessage("Please fill in Contest Name, Submission Deadline, and Voting Duration.");
        return;
      }

      setAdminMessage("Creating contest... Please confirm in MetaMask.");
      const tx = await createContest(contestName, submissionDeadline, votingDuration);
      await tx.wait();

      setAdminMessage("✅ Contest created successfully!");
      setContestName("");
      setSubmissionDeadline("");
      setVotingDuration("");
      await refreshDashboard(account);
    } catch (err: any) {
      setAdminMessage("❌ " + (err.reason || err.message || "Create contest failed"));
    }
  }

  async function handleEndVoting() {
    try {
      setManageMessage("");
      setError("");

      if (!account) {
        setManageMessage("Please connect your wallet first.");
        return;
      }

      if (!manageContestId) {
        setManageMessage("Please enter a contest ID.");
        return;
      }

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
      setError("");

      if (!account) {
        setManageMessage("Please connect your wallet first.");
        return;
      }

      if (!manageContestId) {
        setManageMessage("Please enter a contest ID.");
        return;
      }

      setManageMessage("Finalizing winner... Please confirm in MetaMask.");
      const tx = await finalizeWinner(manageContestId);
      await tx.wait();

      setManageMessage("✅ Winner finalized successfully!");
    } catch (err: any) {
      setManageMessage("❌ " + (err.reason || err.message || "Finalize winner failed"));
    }
  }

  async function handleGetWinner() {
    try {
      setWinnerResult("");
      setError("");

      if (!winnerContestId) {
        setWinnerResult("Please enter a contest ID.");
        return;
      }

      const winnerId = await getWinner(winnerContestId);
      setWinnerResult(`Winner Submission ID: ${winnerId}`);
    } catch (err: any) {
      setWinnerResult("❌ " + (err.reason || err.message || "Failed to get winner"));
    }
  }

  async function handleBuyMembership() {
    try {
      setMembershipMessage("");
      setError("");

      if (!account) {
        setMembershipMessage("Please connect your wallet first.");
        return;
      }

      if (!membershipContestId) {
        setMembershipMessage("Please enter a contest ID.");
        return;
      }

      setMembershipMessage("Purchasing membership... Please confirm in MetaMask.");
      const tx = await purchaseMembership(membershipContestId);
      await tx.wait();

      setMembershipMessage("✅ Membership purchased successfully!");
      await refreshDashboard(account);
    } catch (err: any) {
      setMembershipMessage("❌ " + (err.reason || err.message || "Membership purchase failed"));
    }
  }

  async function handleQuoteTokens() {
    try {
      setTokenBuyMessage("");
      setError("");

      if (!tokenBuyAmount || Number(tokenBuyAmount) <= 0) {
        setTokenBuyMessage("Enter a token amount greater than 0.");
        return;
      }

      const quoted = await getTokenPriceInWei(tokenBuyAmount);
      setTokenPrice(quoted);
      setTokenBuyMessage("Quoted price updated.");
    } catch (err: any) {
      setTokenBuyMessage("❌ " + (err.reason || err.message || "Failed to quote token price"));
    }
  }

  async function handleBuyTokens() {
    try {
      setTokenBuyMessage("");
      setError("");

      if (!account) {
        setTokenBuyMessage("Please connect your wallet first.");
        return;
      }

      if (!tokenBuyContestId || !tokenBuyAmount) {
        setTokenBuyMessage("Please fill in Contest ID and Token Amount.");
        return;
      }

      if (Number(tokenBuyAmount) <= 0) {
        setTokenBuyMessage("Token amount must be greater than 0.");
        return;
      }

      setTokenBuyMessage("Buying tokens... Please confirm in MetaMask.");
      const tx = await buyExtraTokens(tokenBuyContestId, tokenBuyAmount);
      await tx.wait();

      setTokenBuyMessage("✅ Extra voting tokens purchased successfully!");
      await refreshDashboard(account);
      const quoted = await getTokenPriceInWei(tokenBuyAmount);
      setTokenPrice(quoted);
    } catch (err: any) {
      setTokenBuyMessage("❌ " + (err.reason || err.message || "Token purchase failed"));
    }
  }

  async function handleLoadPrizePool() {
    try {
      setTreasuryMessage("");
      setError("");

      if (!poolContestId) {
        setTreasuryMessage("Please enter a contest ID.");
        return;
      }

      const pool = await getContestPrizePool(poolContestId);
      setContestPool(pool);
      setTreasuryMessage("Prize pool loaded.");
    } catch (err: any) {
      setTreasuryMessage("❌ " + (err.reason || err.message || "Failed to load prize pool"));
    }
  }

  async function handleDistributeReward() {
    try {
      setTreasuryMessage("");
      setError("");

      if (!account) {
        setTreasuryMessage("Please connect your wallet first.");
        return;
      }

      if (!poolContestId) {
        setTreasuryMessage("Please enter a contest ID.");
        return;
      }

      setTreasuryMessage("Distributing rewards... Please confirm in MetaMask.");
      const tx = await distributeReward(poolContestId);
      await tx.wait();

      setTreasuryMessage("✅ Rewards distributed successfully!");
      const pool = await getContestPrizePool(poolContestId);
      setContestPool(pool);
      const tb = await getTreasuryBalance();
      setTreasuryBalance(tb);
    } catch (err: any) {
      setTreasuryMessage("❌ " + (err.reason || err.message || "Reward distribution failed"));
    }
  }

  return (
    <main style={{ padding: "40px", fontFamily: "Arial" }}>
      <h1>Novel DAO Frontend</h1>
      <p>Connect your wallet to interact with the DAO smart contracts.</p>

      <button
        onClick={connectWallet}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer",
          borderRadius: "8px",
          border: "1px solid #ccc",
          marginTop: "16px",
        }}
      >
        Connect MetaMask
      </button>

      {account && (
        <div style={{ marginTop: "20px" }}>
          <h2>Connected Address</h2>
          <p>{account}</p>

          <h2>Token Balance</h2>
          <p>{balance}</p>

          <h2>Membership Status</h2>
          <p>{isMember === null ? "Loading..." : isMember ? "Member" : "Not a member"}</p>

          <h2>Role</h2>
          <p>{role || "Loading..."}</p>

          <h2>Next Contest ID (for newly created contest)</h2>
          <p>{nextContestId || "Loading..."}</p>
          <p style={{ color: "#666" }}>Existing contest IDs may be smaller, such as 0.</p>

          <h2>Treasury Balance (wei)</h2>
          <p>{treasuryBalance || "Loading..."}</p>

          <h2>Membership Price (wei)</h2>
          <p>{membershipPrice || "Loading..."}</p>
        </div>
      )}

      <div style={{ marginTop: "40px" }}>
        <h2>Buy Membership</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={membershipContestId}
          onChange={(e) => setMembershipContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleBuyMembership}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Purchase Membership
        </button>

        {membershipMessage && <p style={{ marginTop: "12px" }}>{membershipMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Buy Extra Voting Tokens</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={tokenBuyContestId}
          onChange={(e) => setTokenBuyContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Token Amount"
          value={tokenBuyAmount}
          onChange={(e) => setTokenBuyAmount(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleQuoteTokens}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        >
          Quote Price
        </button>

        <button
          onClick={handleBuyTokens}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Buy Tokens
        </button>

        <p style={{ marginTop: "12px" }}>
          Current Quote (wei): {tokenPrice || "Not quoted yet"}
        </p>

        {tokenBuyMessage && <p style={{ marginTop: "12px" }}>{tokenBuyMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Create Contest</h2>

        <input
          type="text"
          placeholder="Contest Name"
          value={contestName}
          onChange={(e) => setContestName(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Submission Deadline (seconds or timestamp)"
          value={submissionDeadline}
          onChange={(e) => setSubmissionDeadline(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Voting Duration (seconds)"
          value={votingDuration}
          onChange={(e) => setVotingDuration(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleCreateContest}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Create Contest
        </button>

        {adminMessage && <p style={{ marginTop: "12px" }}>{adminMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Submit Novel</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={contestIdInput}
          onChange={(e) => setContestIdInput(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Content URI"
          value={contentURI}
          onChange={(e) => setContentURI(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "400px" }}
        />

        <button
          onClick={handleSubmitNovel}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Submit Novel
        </button>

        {submitMessage && <p style={{ marginTop: "12px" }}>{submitMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>View Submissions</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={viewContestId}
          onChange={(e) => setViewContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleLoadSubmissions}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Load Submissions
        </button>

        {loadMessage && <p style={{ marginTop: "12px" }}>{loadMessage}</p>}

        {submissions.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            {submissions.map((item) => (
              <div
                key={item.submissionId}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "16px",
                  marginBottom: "12px",
                }}
              >
                <p><strong>Submission ID:</strong> {item.submissionId}</p>
                <p><strong>Title:</strong> {item.title || "(empty)"}</p>
                <p><strong>Author:</strong> {item.author}</p>
                <p><strong>Vote Count:</strong> {item.voteCount}</p>
                <p><strong>Content URI:</strong> {item.contentURI || "(empty)"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Vote for Submission</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={voteContestId}
          onChange={(e) => setVoteContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Submission ID"
          value={voteSubmissionId}
          onChange={(e) => setVoteSubmissionId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <input
          type="text"
          placeholder="Vote Amount"
          value={voteAmount}
          onChange={(e) => setVoteAmount(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleVote}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Vote
        </button>

        {voteMessage && <p style={{ marginTop: "12px" }}>{voteMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Contest Management</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={manageContestId}
          onChange={(e) => setManageContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleEndVoting}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        >
          End Voting
        </button>

        <button
          onClick={handleFinalizeWinner}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Finalize Winner
        </button>

        {manageMessage && <p style={{ marginTop: "12px" }}>{manageMessage}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Get Winner</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={winnerContestId}
          onChange={(e) => setWinnerContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleGetWinner}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Get Winner
        </button>

        {winnerResult && <p style={{ marginTop: "12px" }}>{winnerResult}</p>}
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Treasury / Rewards</h2>

        <input
          type="text"
          placeholder="Contest ID"
          value={poolContestId}
          onChange={(e) => setPoolContestId(e.target.value)}
          style={{ display: "block", marginBottom: "10px", padding: "8px", width: "300px" }}
        />

        <button
          onClick={handleLoadPrizePool}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginRight: "10px",
          }}
        >
          Load Prize Pool
        </button>

        <button
          onClick={handleDistributeReward}
          style={{
            padding: "10px 18px",
            fontSize: "15px",
            cursor: "pointer",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        >
          Distribute Reward
        </button>

        <p style={{ marginTop: "12px" }}>
          Contest Prize Pool (wei): {contestPool || "Not loaded yet"}
        </p>

        {treasuryMessage && <p style={{ marginTop: "12px" }}>{treasuryMessage}</p>}
      </div>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}
    </main>
  );
}