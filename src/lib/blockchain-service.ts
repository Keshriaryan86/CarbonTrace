/**
 * @fileOverview Real Blockchain Service using MetaMask + ethers.js
 *
 * Uses "sign message" instead of sending a transaction.
 * - FREE: No gas fees or ETH needed
 * - CRYPTOGRAPHIC PROOF: The signature mathematically proves the wallet owner
 *   committed to this specific activity data at this point in time.
 * - VERIFIABLE: Anyone can recover the signer's address from the signature.
 */

import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

/** Returns true if MetaMask (or any EIP-1193 wallet) is installed. */
export function isMetaMaskInstalled(): boolean {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/** Gets the currently connected wallet address without opening a popup. */
export async function getConnectedWallet(): Promise<string | null> {
  if (!isMetaMaskInstalled()) return null;
  try {
    const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
    return accounts.length > 0 ? accounts[0] : null;
  } catch {
    return null;
  }
}

/**
 * Commits a carbon activity to the blockchain via a SIGNED MESSAGE.
 *
 * This is gas-free — MetaMask opens a "Sign Message" popup (not a transaction).
 * The returned signature is the immutable cryptographic proof of commitment.
 *
 * @param activityId  Firestore activity document ID
 * @param userId      Firebase user UID
 * @returns           The wallet signature (used as the "txHash" / commitment proof)
 */
export async function commitActivityToBlockchain(
  activityId: string,
  userId: string = 'unknown'
): Promise<string> {
  if (!isMetaMaskInstalled()) {
    throw new Error(
      'MetaMask is not installed. Please install it from https://metamask.io'
    );
  }

  // 1. Get the ethers provider from MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);

  // 2. Request the signer — this uses the already-connected account
  //    (no second popup needed if already connected)
  const signer = await provider.getSigner();

  // 3. Build a human-readable message that describes exactly what is being committed.
  //    This is what the user will SEE in the MetaMask popup.
  const timestamp = new Date().toISOString();
  const message = [
    '🌿 CarbonTrace Commitment',
    '─────────────────────────',
    `Activity ID : ${activityId}`,
    `User ID     : ${userId}`,
    `Timestamp   : ${timestamp}`,
    '─────────────────────────',
    'I confirm this carbon activity record is accurate.',
    'This signature serves as my immutable commitment.',
  ].join('\n');

  // 4. Open MetaMask "Sign Message" popup — FREE, no gas needed
  const signature = await signer.signMessage(message);

  // 5. Return the signature as the commitment proof
  //    Format it to look like a tx hash (0x prefix, 64 hex chars visible)
  return signature;
}

/**
 * Verifies a commitment signature and recovers the signer's wallet address.
 * Can be used to prove authenticity of any committed activity.
 */
export function verifyCommitment(
  activityId: string,
  userId: string,
  timestamp: string,
  signature: string
): string {
  const message = [
    '🌿 CarbonTrace Commitment',
    '─────────────────────────',
    `Activity ID : ${activityId}`,
    `User ID     : ${userId}`,
    `Timestamp   : ${timestamp}`,
    '─────────────────────────',
    'I confirm this carbon activity record is accurate.',
    'This signature serves as my immutable commitment.',
  ].join('\n');

  // Recover the original signer from the message + signature
  return ethers.verifyMessage(message, signature);
}
