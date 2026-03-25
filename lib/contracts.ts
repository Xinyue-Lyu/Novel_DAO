import { BrowserProvider, Contract } from "ethers";

declare global {
  interface Window {
    ethereum?: any;
  }
}

const NOVEL_TOKEN_ADDRESS = "0x1a971241945513b72FD4017C8B84380A860e5C34";
const MEMBERSHIP_ADDRESS = "0x2DEF7E95b4d26A7218B8327eD13811E45029a203";
const ROLE_MANAGER_ADDRESS = "0x5bdEC364351BFD78E85abB3253cE5D020328d39e";
const CONTEST_MANAGER_ADDRESS = "0xda6Fe91b1A33bD37CdBD504983Df77485A805548";
const TREASURY_ADDRESS = "0x949d1100549046756FF7fC5E98b25f1D8097bE93";

const NOVEL_TOKEN_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
];

const MEMBERSHIP_ABI = [
  "function checkMembership(address user) view returns (bool)",
];

const ROLE_MANAGER_ABI = [
  "function isAdmin(address user) view returns (bool)",
  "function isAuthor(address user) view returns (bool)",
  "function isReader(address user) view returns (bool)",
];

const CONTEST_MANAGER_ABI = [
  "function nextContestId() view returns (uint256)",
  "function submitNovel(uint256 contestId, string title, string contentURI)",
  "function getSubmissionIds(uint256 contestId) view returns (uint256[])",
  "function submissions(uint256 contestId, uint256 submissionId) view returns (string title, string contentURI, address author, uint256 voteCount, bool exists)",
  "function vote(uint256 contestId, uint256 submissionId, uint256 amount)",
  "function createContest(string name, uint256 submissionDeadline, uint256 votingDuration)",
  "function endVoting(uint256 contestId)",
  "function finalizeWinner(uint256 contestId)",
  "function getWinner(uint256 contestId) view returns (uint256)",
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
  if (!window.ethereum) {
    throw new Error("MetaMask not found");
  }
  return new BrowserProvider(window.ethereum);
}

export async function getTokenBalance(userAddress: string) {
  const provider = getProvider();
  const contract = new Contract(NOVEL_TOKEN_ADDRESS, NOVEL_TOKEN_ABI, provider);
  const balance = await contract.balanceOf(userAddress);
  return balance.toString();
}

export async function getMembershipStatus(userAddress: string) {
  const provider = getProvider();
  const contract = new Contract(MEMBERSHIP_ADDRESS, MEMBERSHIP_ABI, provider);
  return await contract.checkMembership(userAddress);
}

export async function getUserRole(userAddress: string) {
  const provider = getProvider();
  const contract = new Contract(ROLE_MANAGER_ADDRESS, ROLE_MANAGER_ABI, provider);

  const [admin, author, reader] = await Promise.all([
    contract.isAdmin(userAddress),
    contract.isAuthor(userAddress),
    contract.isReader(userAddress),
  ]);

  if (admin) return "Admin";
  if (author) return "Author";
  if (reader) return "Reader";
  return "No role";
}

export async function getNextContestId() {
  const provider = getProvider();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, provider);
  const contestId = await contract.nextContestId();
  return contestId.toString();
}

export async function submitNovel(
  contestId: string,
  title: string,
  contentURI: string
) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, signer);
  return await contract.submitNovel(contestId, title, contentURI);
}

export type Submission = {
  submissionId: string;
  title: string;
  contentURI: string;
  author: string;
  voteCount: string;
  exists: boolean;
};

export async function getSubmissionsByContest(
  contestId: string
): Promise<Submission[]> {
  const provider = getProvider();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, provider);

  const ids = await contract.getSubmissionIds(contestId);

  const submissions = await Promise.all(
    ids.map(async (id: bigint) => {
      const result = await contract.submissions(contestId, id);

      return {
        submissionId: id.toString(),
        title: result[0],
        contentURI: result[1],
        author: result[2],
        voteCount: result[3].toString(),
        exists: result[4],
      };
    })
  );

  return submissions.filter((item) => item.exists);
}

export async function voteForSubmission(
  contestId: string,
  submissionId: string,
  amount: string
) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, signer);
  return await contract.vote(contestId, submissionId, amount);
}

export async function createContest(
  name: string,
  submissionDeadline: string,
  votingDuration: string
) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, signer);
  return await contract.createContest(name, submissionDeadline, votingDuration);
}

export async function endVoting(contestId: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, signer);
  return await contract.endVoting(contestId);
}

export async function finalizeWinner(contestId: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, signer);
  return await contract.finalizeWinner(contestId);
}

export async function getWinner(contestId: string) {
  const provider = getProvider();
  const contract = new Contract(CONTEST_MANAGER_ADDRESS, CONTEST_MANAGER_ABI, provider);
  const winner = await contract.getWinner(contestId);
  return winner.toString();
}

export async function getMembershipPriceInWei() {
  const provider = getProvider();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
  const price = await contract.getMembershipPriceInWei();
  return price.toString();
}

export async function getTokenPriceInWei(tokenAmount: string) {
  const provider = getProvider();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
  const price = await contract.getTokenPriceInWei(tokenAmount);
  return price.toString();
}

export async function getTreasuryBalance() {
  const provider = getProvider();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
  const balance = await contract.getTreasuryBalance();
  return balance.toString();
}

export async function getContestPrizePool(contestId: string) {
  const provider = getProvider();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, provider);
  const pool = await contract.getContestPrizePool(contestId);
  return pool.toString();
}

export async function purchaseMembership(contestId: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);

  const price = await contract.getMembershipPriceInWei();
  return await contract.purchaseMembership(contestId, { value: price });
}

export async function buyExtraTokens(contestId: string, tokenAmount: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);

  const price = await contract.getTokenPriceInWei(tokenAmount);
  return await contract.buyExtraTokens(contestId, tokenAmount, { value: price });
}

export async function distributeReward(contestId: string) {
  const provider = getProvider();
  const signer = await provider.getSigner();
  const contract = new Contract(TREASURY_ADDRESS, TREASURY_ABI, signer);
  return await contract.distributeReward(contestId);
}