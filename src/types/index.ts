import { Address, Hash } from "viem";

export interface AgentIdentity {
  agentId: bigint;
  owner: Address;
  executionWallet: Address;
  name: string;
  metadataHash: Hash;
  capabilities: string[];
  isActive: boolean;
  registeredAt: number;
}

export interface ReliabilityBond {
  agentId: bigint;
  stakedAmount: bigint;
  minimumRequired: bigint;
  slashedAmount: bigint;
  isCompliant: boolean;
  lockedUntil: number;
}

export interface EvaluatorConsensusTask {
  taskId: Hash;
  agentId: bigint;
  rewardPool: bigint;
  requiredEvaluators: number;
  commitDeadline: number;
  revealDeadline: number;
  finalScore: number;
  isResolved: boolean;
}

export interface X402MicropaymentIntent {
  recipient: Address;
  token: Address;
  amount: bigint;
  nonce: bigint;
  deadline: number;
  serviceId: string;
}

export interface SLAAgreement {
  agreementId: Hash;
  client: Address;
  providerAgentId: bigint;
  escrowAmount: bigint;
  penaltyAmount: bigint;
  expiry: number;
  status: "ACTIVE" | "COMPLETED" | "BREACHED" | "DISPUTED";
}
