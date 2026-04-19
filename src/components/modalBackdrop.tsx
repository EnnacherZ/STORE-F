import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import '../styles/modals.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModalBackdropProps {
  children: ReactNode;
  onClose: () => void;
  onOpen: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose, onOpen }) => {
  if (!onOpen) return null;

  return (
    <motion.div
      className="modal-backdrop"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </motion.div>
  );
};

export default ModalBackdrop;