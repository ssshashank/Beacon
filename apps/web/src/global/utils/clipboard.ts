/**
 * Generic clipboard utility function to copy text to clipboard.
 * Returns true if successful, false otherwise.
 */
export const copyToClipboard = async (text?: string): Promise<boolean> => {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("Failed to copy:", err);
    return false;
  }
};
