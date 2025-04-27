import * as THREE from 'three';

/**
 * Creates a checkerboard texture for use as a fallback
 * @param size - Size of the texture in pixels
 * @param squares - Number of squares per side
 * @returns THREE.Texture object
 */
export function createCheckerboardTexture(size = 256, squares = 8): THREE.Texture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const squareSize = size / squares;
  
  for (let y = 0; y < squares; y++) {
    for (let x = 0; x < squares; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#f3e9c7" : "#3b3b3b";
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    }
  }
  
  const texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Linear interpolate between two hex colors
 * @param a - First color in hex format (e.g., "#ff0000")
 * @param b - Second color in hex format (e.g., "#0000ff")
 * @param t - Interpolation factor (0-1)
 * @returns Interpolated color in hex format
 */
export function lerpColor(a: string, b: string, t: number): string {
  const ah = parseInt(a.replace("#", ""), 16);
  const bh = parseInt(b.replace("#", ""), 16);
  const ar = (ah >> 16) & 0xff, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const br = (bh >> 16) & 0xff, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + (br - ar) * t);
  const rg = Math.round(ag + (bg - ag) * t);
  const rb = Math.round(ab + (bb - ab) * t);
  return `#${((1 << 24) + (rr << 16) + (rg << 8) + rb).toString(16).slice(1)}`;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format a timestamp as a relative time (e.g., "2 minutes ago")
 * @param timestamp - Timestamp in milliseconds
 * @returns Formatted relative time
 */
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  
  // Less than a minute
  if (diff < 60000) {
    return 'just now';
  }
  
  // Less than an hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  
  // Less than a week
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  const date = new Date(timestamp);
  return date.toLocaleDateString();
}
