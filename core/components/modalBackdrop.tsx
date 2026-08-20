import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/modals.css';

interface ModalBackdropProps {
  children: ReactNode;
  onClose: () => void;
  onOpen: boolean;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
};

const panelVariants = {
  hidden: { y: 30, opacity: 0, scale: 0.98 },
  visible: { y: 0, opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 320, damping: 28 } },
  exit: { y: 18, opacity: 0, scale: 0.985, transition: { duration: 0.16 } },
};

const ModalBackdrop: React.FC<ModalBackdropProps> = ({ children, onClose, onOpen }) => {
  return (
    <AnimatePresence>
      {onOpen && (
        <motion.div
          className="modal-backdrop"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            className="modal-shell"
            onClick={(e) => e.stopPropagation()}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModalBackdrop;
