export const showToast = (msg: string) => {
  if (typeof window !== 'undefined' && 'Notification' in window) {
    // Fallback: console for web since toast is only used for back-press hint
    console.info(msg);
  }
};
