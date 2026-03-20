'use client';

import Modal from './Modal';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export function ConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel',
  isDanger = false
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
          >
            {cancelText}
          </button>
          <button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-6 py-2 rounded-full text-white font-semibold transition-all ${
              isDanger ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20'
            }`}
          >
            {confirmText}
          </button>
        </>
      }
    >
      <p className="text-slate-300 leading-relaxed">{message}</p>
    </Modal>
  );
}
