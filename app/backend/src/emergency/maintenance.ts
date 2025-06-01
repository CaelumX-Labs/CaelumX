/**
 * Maintenance mode middleware and utility.
 * When enabled, all (or most) API endpoints return a maintenance message.
 * Useful for planned upgrades, migrations, or emergency fixes.
 */

let isMaintenanceMode = false;

export function enableMaintenance1() {
  isMaintenanceMode = true;
  console.info('[MAINTENANCE] API is now in maintenance mode.');
}

export function disableMaintenance() {
  isMaintenanceMode = false;
  console.info('[MAINTENANCE] API is back online.');
}

// Express middleware for global use
export function maintenanceMiddleware(req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): any; new(): any; }; }; }, next: () => void) {
  if (isMaintenanceMode) {
    return res.status(503).json({
      error: 'The platform is undergoing maintenance. Please try again later.',
    });
  }
  next();
}

// Optional: expose status for health checks
export function isMaintenanceOn() {
  return isMaintenanceMode;
}
export const enableMaintenance = () => {
  console.log('Maintenance mode enabled');
};