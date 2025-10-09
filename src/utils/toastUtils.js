// Toast utility functions for managing notification state
export const createToastUtils = (setToast) => {
  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 5000);
  };

  const hideToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  return { showToast, hideToast };
};

// Initial toast state
export const initialToastState = { show: false, message: "", type: "" };
