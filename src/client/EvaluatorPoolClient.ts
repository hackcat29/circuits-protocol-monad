import { type Address, type Hash, keccak256, encodePacked } from "viem";

export class EvaluatorPoolClient {
  public readonly evaluatorPoolAddress: Address;

  constructor(evaluatorPoolAddress: Address) {
    this.evaluatorPoolAddress = evaluatorPoolAddress;
  }

  /**
   * Generates a commit hash for secret evaluation voting.
   * commit = keccak256(score, salt)
   */
  generateCommitment(score: number, salt: Hash): Hash {
    return keccak256(encodePacked(["uint8", "bytes32"], [score, salt]));
  }

  /**
   * Calculates consensus quorum metrics.
   */
  calculateConsensusThreshold(totalStakedWeight: bigint): bigint {
    // 66% supermajority for consensus finality
    return (totalStakedWeight * 2n) / 3n;
  }
}
