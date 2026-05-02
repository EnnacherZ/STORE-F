import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '../contexts/PaymentContext';
import Header from './Header';
import Footer from './Footer';

const TransactionFailed: React.FC = () => {
  const { paymentResponse } = usePayment();
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="d-flex flex-column align-items-center justify-content-center mt-5 p-4">
        <div
          className="card shadow text-center p-4"
          style={{ maxWidth: 480, width: '100%', borderTop: '4px solid #dc3545' }}
        >
          <div style={{ fontSize: 56 }}>❌</div>

          <h4 className="mt-3 text-danger">Payment Failed</h4>

          <p className="text-muted mt-2">
            {paymentResponse?.message ?? 'Something went wrong with your payment.'}
          </p>

          {/* Details — only shown when paymentResponse is available */}
          {paymentResponse && (
            <div className="text-start bg-light rounded p-3 mt-3" style={{ fontSize: 13 }}>
              {paymentResponse.order_id && (
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Order ID</span>
                  <span className="fw-semibold">{paymentResponse.order_id}</span>
                </div>
              )}
              {paymentResponse.transaction_id && (
                <div className="d-flex justify-content-between mt-1">
                  <span className="text-muted">Transaction ID</span>
                  <span className="fw-semibold" style={{ wordBreak: 'break-all' }}>
                    {paymentResponse.transaction_id}
                  </span>
                </div>
              )}
              {paymentResponse.code && (
                <div className="d-flex justify-content-between mt-1">
                  <span className="text-muted">Error Code</span>
                  <span className="fw-semibold">{paymentResponse.code}</span>
                </div>
              )}
            </div>
          )}

          <p className="text-muted mt-3" style={{ fontSize: 12 }}>
            Please keep your transaction ID and contact support if you were charged.
          </p>

          <div className="d-flex gap-2 justify-content-center mt-3">
            <button className="btn btn-outline-secondary" onClick={() => navigate('/')}>
              Go Home
            </button>
            <button className="btn btn-danger" onClick={() => navigate('/checkout')}>
              Try Again
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TransactionFailed;