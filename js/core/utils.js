import { XP_CURVE_EXPONENT, XP_BASE_MULTIPLIER, XP_LEVEL_LINEAR } from './constants.js';

export function xpForLevel(level) {
  if (level <= 0) return 0;
  return Math.floor(
    XP_BASE_MULTIPLIER * Math.pow(level, XP_CURVE_EXPONENT) + level * XP_LEVEL_LINEAR
  );
}

export function formatNumber(num) {
  return num.toLocaleString('de-DE');
}

export function log(message, level = 'info') {
  const prefix = `[${new Date().toLocaleTimeString()}]`;
  console.log(`${prefix} ${message}`);
}