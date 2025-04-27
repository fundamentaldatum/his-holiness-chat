import React from 'react';
import { AbsolveModalProps } from '../../utils/types';

/**
 * Modal for confirming absolution (clearing messages)
 * @param open - Whether the modal is open
 * @param onConfirm - Function to call when the user confirms
 * @param onCancel - Function to call when the user cancels
 * @returns Modal component
 */
export function AbsolveModal({ open, onConfirm, onCancel }: AbsolveModalProps) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 border border-yellow-700 rounded-lg shadow-lg p-6 max-w-xs w-full text-center">
        <div className="almendra-font text-lg text-yellow-200 mb-4">
          For these and all my sins, I am truly sorry
        </div>
        <div className="flex justify-center gap-4">
          <button
            className="almendra-font px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
            onClick={onCancel}
          >
            Keep Praying
          </button>
          <button
            className="almendra-font px-4 py-2 rounded bg-yellow-700 text-white hover:bg-yellow-800"
            onClick={onConfirm}
          >
            Amen
          </button>
        </div>
      </div>
    </div>
  );
}
