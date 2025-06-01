/**
 * Killswitch middleware and utility.
 * When enabled, it blocks critical API routes (e.g., mint, trade, retire).
 * Can be toggled via env variable, admin panel, or config file.
 */

let isKillSwitchActive = false;

// Can be managed via admin dashboard, env var, or CLI
export function activateKillSwitch() {
  isKillSwitchActive = true;
  console.warn('[KILLSWITCH] All critical operations are DISABLED!');
}

export function deactivateKillSwitch() {
  isKillSwitchActive = false;
  console.info('[KILLSWITCH] Operations re-enabled.');
}

// Express middleware to protect sensitive routes
export function killswitchMiddleware(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }, next: () => void) {
  if (isKillSwitchActive) {
    return res.status(503).json({
      error: 'Service temporarily disabled by emergency killswitch. Please try again later or contact support.',
    });
  }
  next();
}

// Optional: expose status for monitoring
export function isKillswitchOn() {
  return isKillSwitchActive;
}
export const killSwitch = async () => {
  console.log('Emergency shutdown initiated');
  process.exit(1);
};
