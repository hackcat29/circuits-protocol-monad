import { type Address, type Hash, keccak256, encodePacked } from "viem";
import { X402MicropaymentIntent } from "../types";

export class X402FacilitatorClient {
  public readonly facilitatorAddress: Address;
  public readonly tokenAddress: Address;

  constructor(facilitatorAddress: Address, tokenAddress: Address) {
    this.facilitatorAddress = facilitatorAddress;
    this.tokenAddress = tokenAddress;
  }

  /**
   * Generates a signed HTTP 402 payment authorization intent for sub-second agent consumption.
   */
  generatePaymentHash(intent: X402MicropaymentIntent): Hash {
    return keccak256(
      encodePacked(
        ["address", "address", "uint256", "uint256", "uint256", "string"],
        [
          intent.recipient,
          intent.token,
          intent.amount,
          intent.nonce,
          BigInt(intent.deadline),
          intent.serviceId,
        ]
      )
    );
  }

  /**
   * Constructs the HTTP 402 Payment-Required response payload.
   */
  buildPaymentChallenge(recipient: Address, requiredAmount: bigint, serviceId: string) {
    return {
      status: 402,
      headers: {
        "X-Payment-Protocol": "x402-v1",
        "X-Payment-Token": this.tokenAddress,
        "X-Payment-Recipient": recipient,
        "X-Payment-Amount": requiredAmount.toString(),
        "X-Payment-Facilitator": this.facilitatorAddress,
        "X-Service-Id": serviceId,
      },
    };
  }
}
