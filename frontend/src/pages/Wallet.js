import React, { useState, useEffect } from 'react';
import { getWallet, requestWithdrawal } from '../services/walletService';
import './Wallet.css';

const Wallet = () => {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('incoming');

  // Withdraw modal state
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawData, setWithdrawData] = useState({ amount: '', phoneNumber: '+250', paymentMethod: 'mtn_momo', notes: '' });
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const data = await getWallet();
      setWallet(data.data);
    } catch (err) {
      setError('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const openWithdraw = () => {
    setWithdrawData({ amount: '', phoneNumber: '+250', paymentMethod: 'mtn_momo', notes: '' });
    setWithdrawResult(null);
    setShowWithdraw(true);
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!withdrawData.amount || Number(withdrawData.amount) <= 0) return;
    try {
      setWithdrawLoading(true);
      const res = await requestWithdrawal({
        ...withdrawData,
        amount: Number(withdrawData.amount)
      });
      setWithdrawResult(res.data);
      // Refresh wallet balance
      fetchWallet();
    } catch (err) {
      alert('Withdrawal failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setWithdrawLoading(false);
    }
  };

  const methodLabel = (m) => {
    const map = { mtn_momo: 'MTN MoMo', orange_money: 'Orange Money', moov_money: 'Moov Money' };
    return map[m] || m;
  };

  const statusBadge = (s) => {
    const cls = { pending: 'badge-yellow', processing: 'badge-blue', completed: 'badge-green', failed: 'badge-red' };
    return <span className={`wallet-badge ${cls[s] || 'badge-yellow'}`}>{s}</span>;
  };

  if (loading) return <div className="spinner"></div>;
  if (error) return <div className="container"><p className="error-msg">{error}</p></div>;

  return (
    <div className="wallet-page">
      <div className="container">
        <h1 className="wallet-title">My Wallet</h1>

        {/* Balance Card */}
        <div className="wallet-balance-card">
          <div className="balance-left">
            <p className="balance-label">Available Balance</p>
            <h2 className="balance-amount">
              {(wallet.balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="balance-currency"> {wallet.currency}</span>
            </h2>
            <p className="balance-note">Earnings credit when mentees initiate payment</p>
          </div>
          <div className="balance-right">
            <button className="btn btn-withdraw" onClick={openWithdraw} disabled={!wallet.balance || wallet.balance <= 0}>
              Withdraw to MoMo
            </button>
          </div>
        </div>

        {/* History Tabs */}
        <div className="wallet-tabs">
          <button
            className={`wallet-tab ${activeTab === 'incoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('incoming')}
          >
            Incoming Payments ({wallet.payments?.length || 0})
          </button>
          <button
            className={`wallet-tab ${activeTab === 'withdrawals' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdrawals')}
          >
            Withdrawals ({wallet.withdrawals?.length || 0})
          </button>
        </div>

        {activeTab === 'incoming' && (
          <div className="wallet-list">
            {!wallet.payments?.length ? (
              <div className="wallet-empty">No incoming payments yet. Earnings appear here when mentees book sessions or enroll in your courses.</div>
            ) : wallet.payments.map((p) => (
              <div key={p._id} className="wallet-tx-card">
                <div className="tx-left">
                  <div className="tx-icon tx-in">↓</div>
                  <div>
                    <p className="tx-label">{p.paymentFor === 'course' ? 'Course Enrollment' : 'Session Booking'}</p>
                    <p className="tx-sub">{p.payer?.name || 'Mentee'} · {methodLabel(p.paymentMethod)}</p>
                    <p className="tx-date">{new Date(p.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="tx-right">
                  <span className="tx-amount tx-amount-in">+{Number(p.amount).toLocaleString()} {p.currency}</span>
                  {statusBadge(p.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="wallet-list">
            {!wallet.withdrawals?.length ? (
              <div className="wallet-empty">No withdrawals yet. Use the "Withdraw to MoMo" button to cash out.</div>
            ) : wallet.withdrawals.map((w) => (
              <div key={w._id} className="wallet-tx-card">
                <div className="tx-left">
                  <div className="tx-icon tx-out">↑</div>
                  <div>
                    <p className="tx-label">Withdrawal — {methodLabel(w.paymentMethod)}</p>
                    <p className="tx-sub">{w.phoneNumber}</p>
                    <p className="tx-date">{new Date(w.createdAt).toLocaleString()}</p>
                    {w.transactionRef && <p className="tx-ref">Ref: {w.transactionRef}</p>}
                  </div>
                </div>
                <div className="tx-right">
                  <span className="tx-amount tx-amount-out">−{Number(w.amount).toLocaleString()} {w.currency}</span>
                  {statusBadge(w.status)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="modal-overlay" onClick={() => { setShowWithdraw(false); setWithdrawResult(null); }}>
          <div className="modal-content withdraw-modal" onClick={e => e.stopPropagation()}>
            {withdrawResult ? (
              <div className="pay-success">
                <div className="pay-success-icon"></div>
                <h2>Withdrawal Initiated!</h2>
                <p>Funds will be sent to <strong>{withdrawResult.withdrawal?.phoneNumber}</strong></p>
                <div className="pay-summary">
                  <div className="pay-row"><span>Amount</span><span>{Number(withdrawResult.withdrawal?.amount).toLocaleString()} {withdrawResult.currency}</span></div>
                  <div className="pay-row"><span>Method</span><span>{methodLabel(withdrawResult.withdrawal?.paymentMethod)}</span></div>
                  <div className="pay-row"><span>New Balance</span><span>{Number(withdrawResult.newBalance).toLocaleString()} {withdrawResult.currency}</span></div>
                  <div className="pay-row"><span>Reference</span><span className="tx-ref">{withdrawResult.withdrawal?.transactionRef}</span></div>
                  <div className="pay-row"><span>Status</span><span className="status-pending">Pending</span></div>
                </div>
                <button className="btn btn-primary" onClick={() => { setShowWithdraw(false); setWithdrawResult(null); }}>
                  Done
                </button>
              </div>
            ) : (
              <>
                <h2>Withdraw Funds</h2>
                <div className="withdraw-balance-info">
                  Available: <strong>{(wallet.balance || 0).toLocaleString()} {wallet.currency}</strong>
                </div>
                <form onSubmit={handleWithdraw}>
                  <div className="form-group">
                    <label>Amount ({wallet.currency})</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="0.00"
                      min="0.01"
                      max={wallet.balance}
                      step="0.01"
                      value={withdrawData.amount}
                      onChange={e => setWithdrawData({ ...withdrawData, amount: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Payment Method</label>
                    <select
                      className="form-control"
                      value={withdrawData.paymentMethod}
                      onChange={e => setWithdrawData({ ...withdrawData, paymentMethod: e.target.value })}
                    >
                      <option value="mtn_momo">MTN Mobile Money</option>
                      <option value="orange_money">Orange Money</option>
                      <option value="moov_money">Moov Money</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Mobile Money Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="e.g. +250 788 000 000"
                      value={withdrawData.phoneNumber}
                      onChange={e => { if (e.target.value.startsWith('+250')) setWithdrawData({ ...withdrawData, phoneNumber: e.target.value }); }}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Notes (optional)</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Weekly payout"
                      value={withdrawData.notes}
                      onChange={e => setWithdrawData({ ...withdrawData, notes: e.target.value })}
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowWithdraw(false)}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-withdraw" disabled={withdrawLoading || !withdrawData.amount || Number(withdrawData.amount) > wallet.balance}>
                      {withdrawLoading ? 'Processing…' : `Withdraw ${withdrawData.amount ? Number(withdrawData.amount).toLocaleString() : ''} ${wallet.currency}`}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
