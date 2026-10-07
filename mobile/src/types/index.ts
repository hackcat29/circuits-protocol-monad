export type ChainKey = "monad" | "arc" | "base" | "bsc" | "solana" | "sui";

export interface ChainConfig {
  id: string;
  name: string;
  chainId: number | string;
  symbol: string;
  color: string;
  badge: string;
  isLive: boolean;
  rpc: string;
  explorer: string;
}

export interface Agent {
  id: string;
  name: string;
  ticker: string;
  displayName: string;
  avatarUrl: string;
  description: string;
  category: "defi" | "social" | "dev" | "research" | "x402";
  chain: ChainKey;
  status: "ACTIVE" | "IDLE" | "MAINTENANCE";
  reputationBps: number; // e.g. 9850 = 98.5%
  jobsCompleted: number;
  hourlyRateUsdc: number;
  marketCapUsdc: number;
  sharePriceUsdc: number;
  foundationModel: string;
  knowledgeDomains: string[];
  capabilities: {
    supportsX402: boolean;
    supportsA2A: boolean;
    supportsMcp: boolean;
  };
  dailyCapUsdc: number;
  walletAddress: string;
  heartbeatAgo: string;
  isTokenized: boolean;
}

export interface ExchangeListing {
  id: string;
  agentId: string;
  agentName: string;
  agentDisplayName: string;
  ticker: string;
  avatarUrl: string;
  chain: ChainKey;
  mode: "BONDING_CURVE" | "OPEN" | "AUCTION";
  status: "ACTIVE" | "SOLD";
  sharePriceUsdc: number;
  valuationUsdc: number;
  sharesAvailable: number;
  totalShares: number;
  change24h: number;
  volume24hUsdc: number;
}

export interface LaunchpadToken {
  id: string;
  name: string;
  ticker: string;
  description: string;
  avatarUrl: string;
  chain: ChainKey;
  priceUsdc: number;
  marketCapUsdc: number;
  volume24hUsdc: number;
  change24h: number;
  progressPercent: number; // 0-100 towards graduation ($69k LP reserve)
  graduated: boolean;
  creatorAddress: string;
  agentId?: string;
  holdersCount: number;
  burnTotalTokens: number;
}

export interface TaskMarketItem {
  id: string;
  title: string;
  taskDescription: string;
  budgetUsdc: number;
  deadlineDays: number;
  category: "Security" | "Research" | "DeFi" | "Inference" | "Development" | "Data";
  chain: ChainKey;
  status: "OPEN" | "IN_PROGRESS" | "ESCROWED" | "COMPLETED";
  employer: string;
  assignedAgent?: string;
  createdAt: string;
}

export interface X402Service {
  id: string;
  hostAgent: string;
  serviceApiName: string;
  description: string;
  capabilities: string[];
  endpointUrl: string;
  pricePerInvocationUsdc: number;
  chain: ChainKey;
  avgLatencyMs: number;
  uptimePercent: number;
  totalCalls: number;
}

export interface SkillItem {
  id: string;
  name: string;
  author: string;
  description: string;
  category: string;
  priceUsdc: number;
  installsCount: number;
  rating: number;
  verified: boolean;
}

export interface KnowledgeItem {
  id: string;
  title: string;
  provider: string;
  description: string;
  vectorCount: string;
  fileSize: string;
  priceUsdc: number;
  category: string;
  tier: "Public" | "Pro" | "Exclusive";
}

export interface DegenPerpMarket {
  pair: string;
  markPrice: number;
  indexPrice: number;
  change24h: number;
  fundingRate: number;
  volume24h: string;
  high24h: number;
  low24h: number;
}

export interface DegenPosition {
  id: string;
  pair: string;
  isLong: boolean;
  sizeUsdc: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  pnlUsdc: number;
  pnlPercent: number;
  liquidationPrice: number;
}

export interface PredictionMarket {
  id: string;
  question: string;
  category: "Crypto" | "AI Agents" | "Milestones" | "Tech";
  volumeUsdc: number;
  yesPercent: number;
  noPercent: number;
  yesPrice: number;
  noPrice: number;
  endDate: string;
}

export interface MemecoinItem {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: string;
  volume24h: string;
  bondingProgress: number;
}

export interface SquadBundle {
  id: string;
  name: string;
  description: string;
  category: string;
  agentMembers: string[];
  priceMonthlyUsdc: number;
  activeSubscribers: number;
  rating: number;
}

export interface GovernanceProposal {
  id: string;
  title: string;
  proposer: string;
  status: "ACTIVE" | "PASSED" | "QUEUED" | "EXECUTED";
  votesFor: number;
  votesAgainst: number;
  totalVotes: number;
  quorumPercent: number;
  endsIn: string;
  description: string;
}

export interface DisputeCase {
  id: string;
  title: string;
  disputedAmountUsdc: number;
  plaintiff: string;
  defendant: string;
  status: "EVIDENCE_GATHERING" | "JUROR_VOTING" | "RESOLVED";
  jurorVotesPlaintiff: number;
  jurorVotesDefendant: number;
  deadlineHours: number;
}

export interface NegotiationContract {
  id: string;
  agentA: string;
  agentB: string;
  terms: string;
  status: "NEGOTIATING" | "MUTUALLY_SIGNED" | "EXECUTION_COMPLETE";
  escrowUsdc: number;
  contractHash: string;
}

export interface RankingUser {
  rank: number;
  name: string;
  address: string;
  avatarUrl: string;
  category: string;
  reputationBps: number;
  earningsUsdc: number;
  jobsCompleted: number;
  badges: string[];
}

export interface WalletBalance {
  symbol: string;
  name: string;
  balance: number;
  valueUsdc: number;
  chain: ChainKey;
  icon?: string;
}

export interface TransactionRecord {
  id: string;
  type: "SWAP" | "ESCROW_DEPOSIT" | "PAYOUT" | "X402_CALL" | "BRIDGE_CCTP" | "STAKE";
  amountUsdc: number;
  chain: ChainKey;
  timestamp: string;
  status: "CONFIRMED" | "PENDING";
  txHash: string;
  description: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorHandle: string;
  avatarUrl: string;
  isAgent: boolean;
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  tipsUsdc: number;
  chain: ChainKey;
}

export interface TerminalEntry {
  type: "input" | "output" | "error" | "system" | "agent";
  text: string;
  timestamp: string;
}
