'use client';

/**
 * MetaMask wallet connect button component.
 * Shows wallet connection status and allows connecting/disconnecting.
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MetaMaskConnectProps {
  onWalletConnected?: (address: string) => void;
  compact?: boolean;
}

// Safe check — only runs client-side
function detectMetaMask(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as any).ethereum !== 'undefined'
  );
}

export function MetaMaskConnect({ onWalletConnected, compact = false }: MetaMaskConnectProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  // Mark as mounted so we only run client-side logic after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Silently check if wallet already connected (no popup)
  const checkExistingConnection = useCallback(async () => {
    if (!detectMetaMask()) return;
    try {
      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_accounts', // does NOT prompt — reads current state only
      });
      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        onWalletConnected?.(accounts[0]);
      }
    } catch (err) {
      // Silently ignore — user just isn't connected yet
      console.warn('[MetaMask] Could not read accounts:', err);
    }
  }, [onWalletConnected]);

  useEffect(() => {
    if (!mounted) return;

    checkExistingConnection();

    // Listen for MetaMask account changes (switch/disconnect)
    if (detectMetaMask()) {
      const eth = (window as any).ethereum;

      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
          onWalletConnected?.(accounts[0]);
        }
      };

      eth.on('accountsChanged', handleAccountsChanged);
      return () => eth.removeListener('accountsChanged', handleAccountsChanged);
    }
  }, [mounted, checkExistingConnection, onWalletConnected]);

  const handleConnect = async () => {
    // MetaMask not installed
    if (!detectMetaMask()) {
      toast({
        variant: 'destructive',
        title: 'MetaMask Not Found',
        description: 'Please install the MetaMask browser extension from metamask.io, then refresh this page.',
      });
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      // This triggers the MetaMask connection popup
      const accounts: string[] = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts returned from MetaMask. Did you reject the connection?');
      }

      const address = accounts[0];
      setWalletAddress(address);
      onWalletConnected?.(address);

      toast({
        title: '✅ Wallet Connected!',
        description: `${address.slice(0, 6)}...${address.slice(-4)} is now connected.`,
      });
    } catch (error: any) {
      // MetaMask error codes:
      // 4001 = user rejected request
      // -32002 = request already pending (MetaMask already has a popup open)
      const code = error?.code;
      let message = 'Could not connect to MetaMask.';

      if (code === 4001) {
        message = 'Connection rejected. Please approve the MetaMask connection request.';
      } else if (code === -32002) {
        message = 'MetaMask already has a pending request. Please open MetaMask and approve it.';
      } else if (error?.message) {
        message = error.message;
      }

      console.error('[MetaMask connect error]', error);
      toast({
        variant: 'destructive',
        title: 'Connection Failed',
        description: message,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Don't render until client-side (avoids SSR mismatch)
  if (!mounted) return null;

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null;

  if (walletAddress) {
    return (
      <Badge
        variant="outline"
        className="flex items-center gap-2 px-3 py-1.5 border-primary/50 text-primary font-code cursor-default select-none"
        title={walletAddress}
      >
        <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
        {shortAddress}
      </Badge>
    );
  }

  return (
    <Button
      variant="outline"
      size={compact ? 'sm' : 'default'}
      onClick={handleConnect}
      disabled={isConnecting}
      className="border-primary/50 text-primary hover:bg-primary/10"
    >
      {isConnecting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Wallet className="mr-2 h-4 w-4" />
      )}
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  );
}
