import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';

const colors = {
  blue: '#4285F4',
  white: '#FFFFFF',
  black: '#000000'
};

const sizes = [
  { name: 'favicon.png', size: 32 },
  { name: 'icon.png', size: 192 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'adaptive-icon.png', size: 1024 },
  { name: 'splash-icon.png', size: 1024 }
];

function createIcon(size, filename) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = colors.black;
  ctx.fillRect(0, 0, size, size);

  // Calculate circle dimensions with padding
  const padding = size * 0.1; // 10% padding
  const circleRadius = (size - padding * 2) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Draw white border circle (outer circle)
  ctx.strokeStyle = colors.white;
  ctx.lineWidth = Math.max(2, size * 0.02); // 2% of size, minimum 2px
  ctx.beginPath();
  ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Draw blue circle (inner circle)
  const innerRadius = circleRadius - (ctx.lineWidth / 2);
  ctx.fillStyle = colors.blue;
  ctx.beginPath();
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
  ctx.fill();

  // Draw white checkmark
  ctx.strokeStyle = colors.white;
  ctx.lineWidth = Math.max(3, size * 0.04); // 4% of size, minimum 3px
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Checkmark dimensions (centered and sized appropriately)
  const checkSize = circleRadius * 0.6; // 60% of circle radius
  const checkOffsetX = centerX - checkSize * 0.2;
  const checkOffsetY = centerY + checkSize * 0.1;

  ctx.beginPath();
  // Left arm of checkmark (going down-left)
  ctx.moveTo(checkOffsetX - checkSize * 0.3, checkOffsetY);
  ctx.lineTo(checkOffsetX - checkSize * 0.1, checkOffsetY + checkSize * 0.25);
  // Right arm of checkmark (going up-right)
  ctx.lineTo(checkOffsetX + checkSize * 0.4, checkOffsetY - checkSize * 0.35);
  ctx.stroke();

  // Save the icon
  const outputPath = join('public', 'icons', filename);
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
  console.log(`Generated ${filename} (${size}x${size})`);
}

// Generate all icons
console.log('Generating app icons...\n');
sizes.forEach(({ name, size }) => {
  createIcon(size, name);
});
console.log('\nAll icons generated successfully!');

