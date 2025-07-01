// Utility to sanitize log messages for safe console output
export function sanitizeLogMessage(input: unknown): string {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters (basic example)
    return input.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
  }
  if (input && typeof input === 'object' && 'message' in input && typeof (input as any).message === 'string') {
    return sanitizeLogMessage((input as any).message);
  }
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
}
