/**
 * Calculate ETA for project completion based on package type and size
 * @param {Date} startDate - Project start date
 * @param {string} packageType - 'basic', 'pro', or 'master'
 * @param {string} size - 'normal' or 'large'
 * @returns {Date} - Estimated completion date
 */
export function calcETA(startDate, packageType, size = 'normal') {
  let baseDays = 0;
  
  // Base turnaround times by package
  switch (packageType) {
    case 'basic':
      baseDays = 3; // 3 days for basic mixing
      break;
    case 'pro':
      baseDays = 5; // 5 days for pro mixing + mastering
      break;
    case 'master':
      baseDays = 7; // 7 days for full master package
      break;
    default:
      baseDays = 5;
  }
  
  // Adjust for project size
  if (size === 'large') {
    baseDays = Math.ceil(baseDays * 1.5);
  }
  
  const eta = new Date(startDate);
  eta.setDate(eta.getDate() + baseDays);
  
  return eta;
}

/**
 * Format date for display
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Calculate hours until deadline
 * @param {Date} deadline
 * @returns {number}
 */
export function hoursUntil(deadline) {
  const now = new Date();
  const diff = new Date(deadline) - now;
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
}

