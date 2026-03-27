"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import SectionCard from "@/components/SectionCard";
import {
  buyExtraTokens,
  distributeReward,
  getContestPrizePool,
  getMembershipPrice,
  getNextContestId,
  getTokenPrice,
  getTreasuryBalance,
  purchaseMembership,
} from "@/lib/contracts";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function TreasuryPage() {
  const [account, setAccount] = useState<string>("");
  const [nextContestId, setNextContestId] = useState<string>("");

  const [membershipContestId, setMembershipContestId] = useState<string>("");
  const [membershipPriceWei, setMembershipPriceWei] = useState<string>("--");
  const [membershipPriceEth, setMembershipPriceEth] = useState<string>("--");
  const [membershipMessage, setMembershipMessage] = useState<string>("");

  const [tokenBuyContestId, setTokenBuyContestId] = useState<string>("");
  const [tokenBuyAmount, setTokenBuyAmount] = useState<string>("1");
  const [tokenPriceWei, setTokenPriceWei] = useState<string>("--");
  const [tokenPriceEth, setTokenPriceEth] = useState<string>("--");
  const [tokenBuyMessage, setTokenBuyMessage] = useState<string>("");

  const [treasuryBalanceWei, setTreasuryBalanceWei] = useState<string>("--");
  const [treasuryBalanceEth, setTreasuryBalanceEth] = useState<string>("--");

  const [poolContestId, setPoolContestId] = useState<string>("");
  const [contestPoolWei, setContestPoolWei] = useState<string>("--");
  const [contestPoolEth, setContestPoolEth] = useState<string>("--");
  const [treasuryMessage, setTreasuryMessage] = useState<string>("");

  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");

  async function connectWallet() {
    try {
      setError("");
      setStatus("Connecting wallet and loading treasury data...");

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

        if (!membershipContestId) setMembershipContestId(latestExisting);
        if (!tokenBuyContestId) setTokenBuyContestId(latestExisting);
        if (!poolContestId) setPoolContestId(latestExisting);
      } catch (err) {
        console.error("getNextContestId failed:", err);
      }

      try {
        const membershipPrice = await getMembershipPrice();
        setMembershipPriceWei(membershipPrice.wei);
        setMembershipPriceEth(membershipPrice.ethFormatted);
      } catch (err) {
        console.error("getMembershipPrice failed:", err);
      }

      try {
        const tokenPrice = await getTokenPrice("1");
        setTokenPriceWei(tokenPrice.wei);
        setTokenPriceEth(tokenPrice.ethFormatted);
      } catch (err) {
        console.error("getTokenPrice failed:", err);
      }

      try {
        const treasury = await getTreasuryBalance();
        setTreasuryBalanceWei(treasury.wei);
        setTreasuryBalanceEth(treasury.ethFormatted);
      } catch (err) {
        console.error("getTreasuryBalance failed:", err);
      }

      setStatus("Treasury page loaded.");
    } catch (err: any) {
      setError(err.message || "Failed to connect wallet.");
      setStatus("");
    }
  }

  async function handleBuyMembership() {
    try {
      setMembershipMessage("");
      if (!account) return setMembershipMessage("Please connect your wallet first.");
      if (!membershipContestId) return setMembershipMessage("Please enter a contest ID.");

      setMembershipMessage("Purchasing membership... Please confirm in MetaMask.");
      const tx = await purchaseMembership(membershipContestId);
      await tx.wait();
      setMembershipMessage("✅ Membership purchased successfully!");

      const treasury = await getTreasuryBalance();
      setTreasuryBalanceWei(treasury.wei);
      setTreasuryBalanceEth(treasury.ethFormatted);
    } catch (err: any) {
      setMembershipMessage("❌ " + (err.reason || err.message || "Membership purchase failed"));
    }
  }

  async function handleQuoteTokens() {
    try {
      setTokenBuyMessage("");
      if (!tokenBuyAmount || Number(tokenBuyAmount) <= 0) {
        return setTokenBuyMessage("Enter a token amount greater than 0.");
      }

      const quoted = await getTokenPrice(tokenBuyAmount);
      setTokenPriceWei(quoted.wei);
      setTokenPriceEth(quoted.ethFormatted);
      setTokenBuyMessage("Quoted price updated.");
    } catch (err: any) {
      setTokenBuyMessage("❌ " + (err.reason || err.message || "Failed to quote token price"));
    }
  }

  async function handleBuyTokens() {
    try {
      setTokenBuyMessage("");
      if (!account) return setTokenBuyMessage("Please connect your wallet first.");
      if (!tokenBuyContestId || !tokenBuyAmount) return setTokenBuyMessage("Please fill in Contest ID and Token Amount.");
      if (Number(tokenBuyAmount) <= 0) return setTokenBuyMessage("Token amount must be greater than 0.");

      setTokenBuyMessage("Buying tokens... Please confirm in MetaMask.");
      const tx = await buyExtraTokens(tokenBuyContestId, tokenBuyAmount);
      await tx.wait();

      setTokenBuyMessage("✅ Extra voting tokens purchased successfully!");

      const quoted = await getTokenPrice(tokenBuyAmount);
      setTokenPriceWei(quoted.wei);
      setTokenPriceEth(quoted.ethFormatted);

      const treasury = await getTreasuryBalance();
      setTreasuryBalanceWei(treasury.wei);
      setTreasuryBalanceEth(treasury.ethFormatted);
    } catch (err: any) {
      setTokenBuyMessage("❌ " + (err.reason || err.message || "Token purchase failed"));
    }
  }

  async function handleLoadPrizePool() {
    try {
      setTreasuryMessage("");
      if (!poolContestId) return setTreasuryMessage("Please enter a contest ID.");

      const pool = await getContestPrizePool(poolContestId);
      setContestPoolWei(pool.wei);
      setContestPoolEth(pool.ethFormatted);
      setTreasuryMessage("Prize pool loaded.");
    } catch (err: any) {
      setTreasuryMessage("❌ " + (err.reason || err.message || "Failed to load prize pool"));
    }
  }

  async function handleDistributeReward() {
    try {
      setTreasuryMessage("");
      if (!account) return setTreasuryMessage("Please connect your wallet first.");
      if (!poolContestId) return setTreasuryMessage("Please enter a contest ID.");

      setTreasuryMessage("Distributing rewards... Please confirm in MetaMask.");
      const tx = await distributeReward(poolContestId);
      await tx.wait();

      setTreasuryMessage("✅ Rewards distributed successfully!");

      const pool = await getContestPrizePool(poolContestId);
      setContestPoolWei(pool.wei);
      setContestPoolEth(pool.ethFormatted);

      const treasury = await getTreasuryBalance();
      setTreasuryBalanceWei(treasury.wei);
      setTreasuryBalanceEth(treasury.ethFormatted);
    } catch (err: any) {
      setTreasuryMessage("❌ " + (err.reason || err.message || "Reward distribution failed"));
    }
  }

  return (
    <main style={{ backgroundColor: "#f9fafb", minHeight: "100vh" }}>
      <Navbar />
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 64px" }}>
        <div style={{ marginBottom: "28px" }}>
          <p style={{ margin: 0, color: "#2563eb", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "13px" }}>
            Payment & Rewards
          </p>
          <h1 style={{ marginTop: "10px", marginBottom: "10px", fontSize: "40px", color: "#111827" }}>
            Treasury
          </h1>
          <p style={{ margin: 0, fontSize: "16px", color: "#6b7280", lineHeight: 1.7, maxWidth: "760px" }}>
            Purchase membership, buy extra voting tokens, inspect treasury balances, and manage prize pool payouts.
          </p>
        </div>

        <SectionCard title="Wallet Connection" description="Connect MetaMask to access treasury functions.">
          <button onClick={connectWallet} style={primaryButton}>Connect MetaMask</button>
          {status && <p style={{ marginTop: "16px", color: "#374151" }}>{status}</p>}
          {error && <p style={{ marginTop: "16px", color: "#dc2626" }}>{error}</p>}
          {account && (
            <div style={panelStyle}>
              <p style={{ margin: 0, fontSize: "14px", color: "#6b7280", fontWeight: 600 }}>Connected Address</p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "#111827", wordBreak: "break-word" }}>{account}</p>
              <p style={{ marginTop: "8px", marginBottom: 0, color: "#6b7280" }}>Next Contest ID: {nextContestId || "--"}</p>
            </div>
          )}
        </SectionCard>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "24px" }}>
          <SectionCard title="Buy Membership" description="Purchase membership for a selected contest.">
            <p style={{ marginTop: 0, color: "#374151" }}>Membership Price: {membershipPriceEth !== "--" ? `${membershipPriceEth} ETH` : "--"}</p>
            <p style={{ color: "#6b7280", marginTop: "-6px" }}>Raw wei: {membershipPriceWei}</p>

            <input type="text" placeholder="Contest ID" value={membershipContestId} onChange={(e) => setMembershipContestId(e.target.value)} style={inputStyle} />
            <button onClick={handleBuyMembership} style={primaryButton}>Purchase Membership</button>
            {membershipMessage && <p style={{ marginTop: "12px" }}>{membershipMessage}</p>}
          </SectionCard>

          <SectionCard title="Buy Extra Voting Tokens" description="Quote cost first, then buy extra voting tokens.">
            <input type="text" placeholder="Contest ID" value={tokenBuyContestId} onChange={(e) => setTokenBuyContestId(e.target.value)} style={inputStyle} />
            <input type="text" placeholder="Token Amount" value={tokenBuyAmount} onChange={(e) => setTokenBuyAmount(e.target.value)} style={inputStyle} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleQuoteTokens} style={secondaryButton}>Quote Price</button>
              <button onClick={handleBuyTokens} style={primaryButton}>Buy Tokens</button>
            </div>

            <p style={{ marginTop: "14px", color: "#374151" }}>Current Quote: {tokenPriceEth !== "--" ? `${tokenPriceEth} ETH` : "--"}</p>
            <p style={{ color: "#6b7280", marginTop: "-6px" }}>Raw wei: {tokenPriceWei}</p>

            {tokenBuyMessage && <p style={{ marginTop: "12px" }}>{tokenBuyMessage}</p>}
          </SectionCard>
        </div>

        <div style={{ marginTop: "24px" }}>
          <SectionCard title="Treasury & Prize Pool" description="Inspect treasury balance, check contest prize pool, and distribute rewards.">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "20px" }}>
              <div style={panelStyle}>
                <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>Treasury Balance</p>
                <p style={{ marginTop: "8px", marginBottom: "6px", fontSize: "20px", fontWeight: 700 }}>
                  {treasuryBalanceEth !== "--" ? `${treasuryBalanceEth} ETH` : "--"}
                </p>
                <p style={{ margin: 0, color: "#6b7280", wordBreak: "break-word" }}>Raw wei: {treasuryBalanceWei}</p>
              </div>

              <div style={panelStyle}>
                <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>Contest Prize Pool</p>
                <p style={{ marginTop: "8px", marginBottom: "6px", fontSize: "20px", fontWeight: 700 }}>
                  {contestPoolEth !== "--" ? `${contestPoolEth} ETH` : "--"}
                </p>
                <p style={{ margin: 0, color: "#6b7280", wordBreak: "break-word" }}>Raw wei: {contestPoolWei}</p>
              </div>
            </div>

            <input type="text" placeholder="Contest ID" value={poolContestId} onChange={(e) => setPoolContestId(e.target.value)} style={{ ...inputStyle, maxWidth: "320px" }} />

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={handleLoadPrizePool} style={secondaryButton}>Load Prize Pool</button>
              <button onClick={handleDistributeReward} style={primaryButton}>Distribute Reward</button>
            </div>

            {treasuryMessage && <p style={{ marginTop: "12px" }}>{treasuryMessage}</p>}
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