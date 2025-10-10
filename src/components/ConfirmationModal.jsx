import React from "react";
import { AiOutlineWarning } from "react-icons/ai";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-red-600 hover:bg-red-700",
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-white/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <AiOutlineWarning className="h-6 w-6 text-yellow-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 text-sm">{message}</p>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:bg-gray-50 disabled:opacity-50 rounded-lg transition-colors duration-200"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white ${confirmButtonClass} disabled:opacity-50 rounded-lg transition-colors duration-200 flex items-center gap-2`}
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
