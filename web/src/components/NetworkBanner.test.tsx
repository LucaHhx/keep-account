import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import NetworkBanner from './NetworkBanner';
import { useNetworkStore } from '../stores/network';

describe('NetworkBanner', () => {
  beforeEach(() => {
    useNetworkStore.setState({ isOnline: true });
  });

  // TC-016: Does not render when online
  it('does not render when online', () => {
    useNetworkStore.setState({ isOnline: true });

    const { container } = render(<NetworkBanner />);
    expect(container.firstChild).toBeNull();
  });

  // TC-017: Shows banner when offline
  it('shows banner when offline', () => {
    useNetworkStore.setState({ isOnline: false });

    render(<NetworkBanner />);
    expect(screen.getByText(/无网络连接/)).toBeInTheDocument();
  });

  // TC-018: Banner disappears when network restores
  it('banner disappears when network restores', () => {
    useNetworkStore.setState({ isOnline: false });

    const { rerender } = render(<NetworkBanner />);
    expect(screen.getByText(/无网络连接/)).toBeInTheDocument();

    useNetworkStore.setState({ isOnline: true });
    rerender(<NetworkBanner />);
    expect(screen.queryByText(/无网络连接/)).toBeNull();
  });
});
