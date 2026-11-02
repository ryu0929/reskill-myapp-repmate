import type { ToastProps } from "./_types/toast";

const Toast = ({ message }: ToastProps) => (
  <div
    role="status"
    aria-live="polite"
    className={`fixed bottom-6 left-1/2 z-50 max-w-[calc(100%-32px)] -translate-x-1/2 rounded-lg border border-[#273142] bg-[#17213a] px-5 py-3 text-center text-sm font-bold text-[#f8fafc] shadow-xl transition-all duration-200 ${
      message
        ? "translate-y-0 opacity-100"
        : "pointer-events-none translate-y-2 opacity-0"
    }`}
  >
    {message}
  </div>
);

export default Toast;
