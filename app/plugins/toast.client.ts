/**
 * Toast Plugin
 * Provides consistent toast notifications across the application
 */

export default defineNuxtPlugin(() => {
  const toast = useToast();

  // Standardized toast icons
  const TOAST_ICONS = {
    success: "i-heroicons-check-circle",
    error: "i-heroicons-x-circle",
    info: "i-heroicons-information-circle",
    warning: "i-heroicons-exclamation-triangle",
  } as const;

  // Helper function to show toast
  const showToast = (
    title: string,
    type: "success" | "error" | "info" | "warning" = "success",
    options?: {
      description?: string;
      progress?: boolean;
    }
  ) => {
    toast.add({
      title,
      description: options?.description,
      color: type,
      icon: TOAST_ICONS[type],
      progress: options?.progress ?? false,
    });
  };

  // Convenience methods
  const success = (title: string, description?: string) => {
    showToast(title, "success", { description });
  };

  const error = (title: string, description?: string) => {
    showToast(title, "error", { description });
  };

  const info = (title: string, description?: string) => {
    showToast(title, "info", { description });
  };

  const warning = (title: string, description?: string) => {
    showToast(title, "warning", { description });
  };

  // Error handler helper
  const handleError = (err: unknown, defaultMessage: string) => {
    console.error(err);
    const message = err instanceof Error ? err.message : defaultMessage;
    error(message);
  };

  return {
    provide: {
      toast: {
        show: showToast,
        success,
        error,
        info,
        warning,
        handleError,
      },
    },
  };
});
