/**
 * @fileOverview Blockchain Service Mock
 * Reverted to a simple mock to avoid conflicts with analysis logic.
 */

export async function commitActivityToBlockchain(activityId: string): Promise<string> {
  // Simple mock for transaction hash generation
  return new Promise((resolve) => {
    setTimeout(() => {
      const txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
      resolve(txHash);
    }, 1000);
  });
}
