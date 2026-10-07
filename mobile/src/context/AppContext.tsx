import React, { createContext, useContext, useState, useMemo } from "react";
import {
  ChainKey,
  Agent,
  LaunchpadToken,
  TaskMarketItem,
  DegenPosition,
  GovernanceProposal,
  SocialPost,
  TransactionRecord,
} from "../types";
import {
  AGENTS_DATA,
  LAUNCHPAD_TOKENS,
  TASK_MARKET_ITEMS,
  DEGEN_POSITIONS_DATA,
  GOVERNANCE_PROPOSALS,
  SOCIAL_POSTS,
  TRANSACTIONS_HISTORY,
  CHAINS,
} from "../data/mockData";

export type NavTab =
  | "dashboard"
  | "agents"
  | "exchange"
  | "launchpad"
  | "commerce"
  | "degen"
  | "build"
  | "terminal"
  | "governance"
  | "rankings"
  | "wallet"
  | "social";

interface AppContextType {
  selectedChain: ChainKey;
  setSelectedChain: (chain: ChainKey) => void;
  walletConnected: boolean;
  walletAddress: string;
  usdcBalance: number;
  connectWallet: () => void;
  disconnectWallet: () => void;
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  quickActionModalOpen: boolean;
  setQuickActionModalOpen: (open: boolean) => void;
  chainModalOpen: boolean;
  setChainModalOpen: (open: boolean) => void;
  notificationsModalOpen: boolean;
  setNotificationsModalOpen: (open: boolean) => void;
  unreadNotifications: number;
  // Dynamic Entities
  agents: Agent[];
  registerAgent: (newAgent: Partial<Agent>) => void;
  launchpadTokens: LaunchpadToken[];
  createLaunchpadToken: (token: Partial<LaunchpadToken>) => void;
  tasks: TaskMarketItem[];
  createTask: (task: Partial<TaskMarketItem>) => void;
  positions: DegenPosition[];
  openPosition: (pair: string, isLong: boolean, sizeUsdc: number, leverage: number) => void;
  closePosition: (id: string) => void;
  proposals: GovernanceProposal[];
  voteProposal: (proposalId: string, support: boolean) => void;
  socialPosts: SocialPost[];
  createPost: (content: string) => void;
  tipPost: (postId: string, amount: number) => void;
  transactions: TransactionRecord[];
  bridgeUsdc: (fromChain: ChainKey, toChain: ChainKey, amount: number) => boolean;
  // UI Helpers
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedChain, setSelectedChain] = useState<ChainKey>("arc");
  const [walletConnected, setWalletConnected] = useState<boolean>(true);
  const [walletAddress, setWalletAddress] = useState<string>("0x71CB...3fAd");
  const [usdcBalance, setUsdcBalance] = useState<number>(4850.5);
  const [activeTab, setActiveTab] = useState<NavTab>("dashboard");
  const [quickActionModalOpen, setQuickActionModalOpen] = useState<boolean>(false);
  const [chainModalOpen, setChainModalOpen] = useState<boolean>(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState<boolean>(false);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(3);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Entities
  const [agents, setAgents] = useState<Agent[]>(AGENTS_DATA);
  const [launchpadTokens, setLaunchpadTokens] = useState<LaunchpadToken[]>(LAUNCHPAD_TOKENS);
  const [tasks, setTasks] = useState<TaskMarketItem[]>(TASK_MARKET_ITEMS);
  const [positions, setPositions] = useState<DegenPosition[]>(DEGEN_POSITIONS_DATA);
  const [proposals, setProposals] = useState<GovernanceProposal[]>(GOVERNANCE_PROPOSALS);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(SOCIAL_POSTS);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(TRANSACTIONS_HISTORY);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const connectWallet = () => {
    setWalletConnected(true);
    setWalletAddress("0x71CB...3fAd");
    showToast("Wallet Connected to " + CHAINS[selectedChain].name);
  };

  const disconnectWallet = () => {
    setWalletConnected(false);
    showToast("Wallet Disconnected");
  };

  const registerAgent = (newAgent: Partial<Agent>) => {
    const fullAgent: Agent = {
      id: `agent-${Date.now()}`,
      name: (newAgent.name || "new-agent").toLowerCase().replace(/\s+/g, "-"),
      ticker: newAgent.ticker || "NEW",
      displayName: newAgent.displayName || "New Agent",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
      description: newAgent.description || "Autonomous AI agent deployed on Circuits Protocol.",
      category: newAgent.category || "dev",
      chain: selectedChain,
      status: "ACTIVE",
      reputationBps: 9800,
      jobsCompleted: 0,
      hourlyRateUsdc: newAgent.hourlyRateUsdc || 20,
      marketCapUsdc: 100000,
      sharePriceUsdc: 1.0,
      foundationModel: newAgent.foundationModel || "Llama 3.3 70B",
      knowledgeDomains: newAgent.knowledgeDomains || ["General Tasks", "On-Chain Actions"],
      capabilities: { supportsX402: true, supportsA2A: true, supportsMcp: true },
      dailyCapUsdc: newAgent.dailyCapUsdc || 50,
      walletAddress: "0x" + Math.random().toString(16).substring(2, 42),
      heartbeatAgo: "just now",
      isTokenized: false,
      ...newAgent,
    };
    setAgents((prev) => [fullAgent, ...prev]);
    showToast(`Agent "${fullAgent.displayName}" registered on-chain!`);
  };

  const createLaunchpadToken = (token: Partial<LaunchpadToken>) => {
    const fullToken: LaunchpadToken = {
      id: `token-${Date.now()}`,
      name: token.name || "New Token",
      ticker: token.ticker?.startsWith("$") ? token.ticker : `$${token.ticker || "TOKEN"}`,
      description: token.description || "Fair-launch agent token on Arc.",
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${Date.now()}`,
      chain: selectedChain,
      priceUsdc: 0.0001,
      marketCapUsdc: 100000,
      volume24hUsdc: 0,
      change24h: 0,
      progressPercent: 5,
      graduated: false,
      creatorAddress: walletAddress,
      holdersCount: 1,
      burnTotalTokens: 0,
      ...token,
    };
    setLaunchpadTokens((prev) => [fullToken, ...prev]);
    showToast(`Token "${fullToken.ticker}" launched on bonding curve!`);
  };

  const createTask = (task: Partial<TaskMarketItem>) => {
    const fullTask: TaskMarketItem = {
      id: `task-${Date.now()}`,
      title: task.title || "New Task",
      taskDescription: task.taskDescription || "Task description specification.",
      budgetUsdc: task.budgetUsdc || 50,
      deadlineDays: task.deadlineDays || 3,
      category: task.category || "Security",
      chain: selectedChain,
      status: "OPEN",
      employer: walletAddress,
      createdAt: "just now",
      ...task,
    };
    setTasks((prev) => [fullTask, ...prev]);
    showToast(`Task "${fullTask.title}" posted to Marketplace!`);
  };

  const openPosition = (pair: string, isLong: boolean, sizeUsdc: number, leverage: number) => {
    const prices: Record<string, number> = {
      "BTC/USD": 94250,
      "ETH/USD": 3420,
      "SOL/USD": 185,
      "CLAW/USD": 4.25,
    };
    const entry = prices[pair] || 100;
    const newPos: DegenPosition = {
      id: `pos-${Date.now()}`,
      pair,
      isLong,
      sizeUsdc,
      entryPrice: entry,
      markPrice: entry,
      leverage,
      pnlUsdc: 0,
      pnlPercent: 0,
      liquidationPrice: isLong ? entry * (1 - 0.9 / leverage) : entry * (1 + 0.9 / leverage),
    };
    setPositions((prev) => [newPos, ...prev]);
    setUsdcBalance((prev) => Math.max(0, prev - sizeUsdc));
    showToast(`Opened ${leverage}x ${isLong ? "LONG" : "SHORT"} on ${pair}`);
  };

  const closePosition = (id: string) => {
    const pos = positions.find((p) => p.id === id);
    if (pos) {
      setUsdcBalance((prev) => prev + pos.sizeUsdc + pos.pnlUsdc);
      setPositions((prev) => prev.filter((p) => p.id !== id));
      showToast(`Closed ${pos.pair} position. PnL: ${pos.pnlUsdc >= 0 ? "+" : ""}$${pos.pnlUsdc.toFixed(2)}`);
    }
  };

  const voteProposal = (proposalId: string, support: boolean) => {
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === proposalId) {
          return {
            ...p,
            votesFor: support ? p.votesFor + 50000 : p.votesFor,
            votesAgainst: !support ? p.votesAgainst + 50000 : p.votesAgainst,
            totalVotes: p.totalVotes + 50000,
          };
        }
        return p;
      })
    );
    showToast(`Vote cast: ${support ? "FOR" : "AGAINST"} (${proposalId})`);
  };

  const createPost = (content: string) => {
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      authorName: "Builder (You)",
      authorHandle: "@builder_arc",
      avatarUrl: "https://api.dicebear.com/7.x/bottts/svg?seed=you",
      isAgent: false,
      content,
      timestamp: "just now",
      likes: 1,
      comments: 0,
      tipsUsdc: 0,
      chain: selectedChain,
    };
    setSocialPosts((prev) => [newPost, ...prev]);
    showToast("Post shared to Circuits Social Feed!");
  };

  const tipPost = (postId: string, amount: number) => {
    if (usdcBalance < amount) {
      showToast("Insufficient USDC balance");
      return;
    }
    setUsdcBalance((prev) => prev - amount);
    setSocialPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, tipsUsdc: p.tipsUsdc + amount, likes: p.likes + 1 } : p))
    );
    showToast(`Tipped $${amount} USDC to agent!`);
  };

  const bridgeUsdc = (fromChain: ChainKey, toChain: ChainKey, amount: number) => {
    if (usdcBalance < amount) {
      showToast("Insufficient USDC balance to bridge");
      return false;
    }
    setUsdcBalance((prev) => prev - amount);
    const newTx: TransactionRecord = {
      id: `tx-${Date.now()}`,
      type: "BRIDGE_CCTP",
      amountUsdc: amount,
      chain: toChain,
      timestamp: "just now",
      status: "CONFIRMED",
      txHash: "0x" + Math.random().toString(16).substring(2, 10) + "...cctp",
      description: `Bridged $${amount} USDC from ${CHAINS[fromChain].name} to ${CHAINS[toChain].name}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    showToast(`Initiated Circle CCTP zero-slippage bridge for $${amount} USDC!`);
    return true;
  };

  const value = useMemo(
    () => ({
      selectedChain,
      setSelectedChain,
      walletConnected,
      walletAddress,
      usdcBalance,
      connectWallet,
      disconnectWallet,
      activeTab,
      setActiveTab,
      quickActionModalOpen,
      setQuickActionModalOpen,
      chainModalOpen,
      setChainModalOpen,
      notificationsModalOpen,
      setNotificationsModalOpen,
      unreadNotifications,
      agents,
      registerAgent,
      launchpadTokens,
      createLaunchpadToken,
      tasks,
      createTask,
      positions,
      openPosition,
      closePosition,
      proposals,
      voteProposal,
      socialPosts,
      createPost,
      tipPost,
      transactions,
      bridgeUsdc,
      toastMessage,
      showToast,
    }),
    [
      selectedChain,
      walletConnected,
      walletAddress,
      usdcBalance,
      activeTab,
      quickActionModalOpen,
      chainModalOpen,
      notificationsModalOpen,
      unreadNotifications,
      agents,
      launchpadTokens,
      tasks,
      positions,
      proposals,
      socialPosts,
      transactions,
      toastMessage,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
