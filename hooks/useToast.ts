import { toast as sonnerToast } from "sonner";

// Toast function that wraps sonnerToast
type ToastOptions = {
  title?: string;
  description?: string;
  type?: "success" | "info" | "warning" | "error";
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
};

function toast({
  title,
  description,
  type = "success",
  action,
  duration,
}: ToastOptions) {
  sonnerToast[type](title, {
    description,
    duration,
    action: action
      ? {
          label: action.label,
          onClick: action.onClick,
        }
      : undefined,
  });
}

// Hook to provide toast functionality
function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast };
