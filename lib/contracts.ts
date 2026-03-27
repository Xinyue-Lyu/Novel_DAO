import { BrowserProvider, Contract, formatEther, formatUnits } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const ADDRESSES = {
  novelToken: "0xaa75FD8D5D7F356597Eddd0941f72F4410a71Ba5",
  membership: "0xf9aCf72AA75D38eFF8bd303cf665deEFC1197783",
  roleManager: "0xF26eE1390be47532c9d7901bC6Aff6917cD25AB3",
  contestManager: "0x3D77cf5f53900f8f41Ef5d4542393B7Fd75f1d4c",
  treasury: "0xA02fDbfA8318abf9f2dFe72487106B26904035ed",
  governor: "0x5b66103ffcb541C6cb5108c313D0a4344359834a",
};

const NOVEL_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function totalSupply() view returns (uint256)",
  "function MAX_SUPPLY() view returns (uint256)",
];

const ROLE_MANAGER_ABI = [
  "function checkMembership(address user) view returns (bool)",
  "function isMember(address user) view returns (bool)",
];

const CONTEST_MANAGER_ABI = [
  "function nextContestId() view returns (uint256)",
  "function nextSubmissionId() view returns (uint256)",
  "function createContest(string name, uint256 deadline)",
  "function endVoting(uint256 contestId)",
  "function finalizeWinner(uint256 contestId)",
  "function submitNovel(uint256 contestId, string title, string contentURI)",
  "function vote(uint256 contestId, uint256 submissionId, uint256 amount)",
  "function getSubmission(uint256 contestId, uint256 submissionId) view returns ((string title,string contentURI,address author,uint256 voteCount,bool exists))",
  "function getTop3SubmissionIds(uint256 contestId) view returns (uint256[3])",
  "function getTop3Authors(uint256 contestId) view returns (address[3])",
  "function membership() view returns (address)",
  "function roleManager() view returns (address)",
  "function contests(uint256) view returns (string name, uint256 deadline, bool active, bool exists, bool winnerFinalized, uint256 submissionCount)",
  "function contestSubmissionIds(uint256, uint256) view returns (uint256)",
];

const TREASURY_ABI = [
  "function getMembershipPriceInWei() view returns (uint256)",
  "function getTokenPriceInWei(uint256 tokenAmount) view returns (uint256)",
  "function getTreasuryBalance() view returns (uint256)",
  "function getContestPrizePool(uint256 contestId) view returns (uint256)",
  "function purchaseMembership(uint256 contestId) payable",
  "function buyExtraTokens(uint256 contestId, uint256 tokenAmount) payable",
  "function distributeReward(uint256 contestId)",
];

function getProvider() {
  if (!window.ethereum) throw new Error("MetaMask not found");
  return new BrowserProvider(window.ethereum);
}

async function getSigner() {
  const provider = getProvider();
  return await provider.getSigner();
}

export type TokenInfo = {
  rawBalance: string;
  balanceFormatted: string;
  decimals: number;
  symbol: string;
  totalSupply: string;
  maxSupply: string;
};

export async function getTokenInfo(userAddress: string): Promise<TokenInfo> {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.novelToken, NOVEL_TOKEN_ABI, provider);

  const [rawBalance, decimals, symbol, totalSupply, maxSupply] = await Promise.all([
    contract.balanceOf(userAddress),
    contract.decimals(),
    contract.symbol(),
    contract.totalSupply(),
    contract.MAX_SUPPLY(),
  ]);

  return {
    rawBalance: rawBalance.toString(),
    balanceFormatted: formatUnits(rawBalance, decimals),
    decimals: Number(decimals),
    symbol,
    totalSupply: formatUnits(totalSupply, decimals),
    maxSupply: formatUnits(maxSupply, decimals),
  };
}

export async function getMembershipStatus(userAddress: string): Promise<boolean | null> {
  const provider = getProvider();

  try {
    const roleManager = new Contract(ADDRESSES.roleManager, ROLE_MANAGER_ABI, provider);
    return await roleManager.checkMembership(userAddress);
  } catch (err) {
    console.warn("RoleManager.checkMembership failed:", err);
  }

  try {
    const roleManager = new Contract(ADDRESSES.roleManager, ROLE_MANAGER_ABI, provider);
    return await roleManager.isMember(userAddress);
  } catch (err) {
    console.warn("RoleManager.isMember failed:", err);
  }

  try {
    const contestManager = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);
    const linkedRoleManager = await contestManager.roleManager();
    const roleManager = new Contract(linkedRoleManager, ROLE_MANAGER_ABI, provider);
    return await roleManager.checkMembership(userAddress);
  } catch (err) {
    console.warn("ContestManager.roleManager fallback failed:", err);
  }

  return null;
}

export type ContestInfo = {
  name: string;
  deadline: string;
  active: boolean;
  exists: boolean;
  winnerFinalized: boolean;
  submissionCount: string;
};

export async function getNextContestId(): Promise<string> {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);
  const value = await contract.nextContestId();
  return value.toString();
}

export async function getContestInfo(contestId: string): Promise<ContestInfo> {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);
  const result = await contract.contests(contestId);

  return {
    name: result[0],
    deadline: result[1].toString(),
    active: result[2],
    exists: result[3],
    winnerFinalized: result[4],
    submissionCount: result[5].toString(),
  };
}

export async function createContest(name: string, deadline: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, signer);
  return await contract.createContest(name, deadline);
}

export async function endVoting(contestId: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, signer);
  return await contract.endVoting(contestId);
}

export async function finalizeWinner(contestId: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, signer);
  return await contract.finalizeWinner(contestId);
}

export async function submitNovel(contestId: string, title: string, contentURI: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, signer);
  return await contract.submitNovel(contestId, title, contentURI);
}

export async function voteForSubmission(contestId: string, submissionId: string, amount: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, signer);
  return await contract.vote(contestId, submissionId, amount);
}

export type Submission = {
  submissionId: string;
  title: string;
  contentURI: string;
  author: string;
  voteCount: string;
  exists: boolean;
};

export async function getSubmissionsByContest(contestId: string): Promise<Submission[]> {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);

  const contest = await contract.contests(contestId);
  const submissionCount = Number(contest[5]);

  const rows: Submission[] = [];

  for (let i = 0; i < submissionCount; i++) {
    try {
      const submissionId = await contract.contestSubmissionIds(contestId, i);
      const s = await contract.getSubmission(contestId, submissionId);

      rows.push({
        submissionId: submissionId.toString(),
        title: s[0],
        contentURI: s[1],
        author: s[2],
        voteCount: s[3].toString(),
        exists: s[4],
      });
    } catch (err) {
      console.warn("submission load failed at index", i, err);
    }
  }

  return rows.filter((x) => x.exists);
}

export type WinnerInfo = {
  title: string;
  contentURI: string;
  author: string;
  voteCount: string;
  exists: boolean;
};

export async function getWinner(contestId: string): Promise<WinnerInfo> {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);
  const top3Ids = await contract.getTop3SubmissionIds(contestId);

  const firstId = top3Ids[0];
  const s = await contract.getSubmission(contestId, firstId);

  return {
    title: s[0],
    contentURI: s[1],
    author: s[2],
    voteCount: s[3].toString(),
    exists: s[4],
  };
}

export async function getTop3(contestId: string) {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.contestManager, CONTEST_MANAGER_ABI, provider);

  const [ids, authors] = await Promise.all([
    contract.getTop3SubmissionIds(contestId),
    contract.getTop3Authors(contestId),
  ]);

  return {
    submissionIds: ids.map((x: bigint) => x.toString()),
    authors: [...authors],
  };
}

export async function getMembershipPrice() {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, provider);
  const wei = await contract.getMembershipPriceInWei();
  return { wei: wei.toString(), ethFormatted: formatEther(wei) };
}

export async function getTokenPrice(tokenAmount: string) {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, provider);
  const wei = await contract.getTokenPriceInWei(tokenAmount);
  return { wei: wei.toString(), ethFormatted: formatEther(wei) };
}

export async function getTreasuryBalance() {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, provider);
  const wei = await contract.getTreasuryBalance();
  return { wei: wei.toString(), ethFormatted: formatEther(wei) };
}

export async function getContestPrizePool(contestId: string) {
  const provider = getProvider();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, provider);
  const wei = await contract.getContestPrizePool(contestId);
  return { wei: wei.toString(), ethFormatted: formatEther(wei) };
}

export async function purchaseMembership(contestId: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, signer);
  const price = await contract.getMembershipPriceInWei();
  return await contract.purchaseMembership(contestId, { value: price });
}

export async function buyExtraTokens(contestId: string, tokenAmount: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, signer);
  const price = await contract.getTokenPriceInWei(tokenAmount);
  return await contract.buyExtraTokens(contestId, tokenAmount, { value: price });
}

export async function distributeReward(contestId: string) {
  const signer = await getSigner();
  const contract = new Contract(ADDRESSES.treasury, TREASURY_ABI, signer);
  return await contract.distributeReward(contestId);
}