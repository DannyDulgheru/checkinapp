import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background - black
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, size, size);

  // Circle with gradient
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45; // Slightly smaller to have some padding

  // Create gradient from red-orange to yellow-orange
  const gradient = ctx.createRadialGradient(
    centerX, centerY - radius * 0.3,
    radius * 0.3,
    centerX, centerY,
    radius
  );
  
  // Gradient colors: bright red-orange at top to warm yellow-orange at bottom
  gradient.addColorStop(0, '#FF6B35'); // Bright red-orange
  gradient.addColorStop(0.5, '#FF8C42'); // Orange
  gradient.addColorStop(1, '#FFB347'); // Warm yellow-orange

  // Draw circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw checkmark - black, thick, smooth
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = size * 0.12; // Thick line relative to icon size
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Checkmark path - smooth curved checkmark
  const checkSize = radius * 0.6;
  const startX = centerX - checkSize * 0.4;
  const startY = centerY;
  const middleX = centerX - checkSize * 0.05;
  const middleY = centerY + checkSize * 0.3;
  const endX = centerX + checkSize * 0.4;
  const endY = centerY - checkSize * 0.3;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.quadraticCurveTo(middleX, middleY, endX, endY);
  ctx.stroke();

  return canvas.toBuffer('image/png');
}

// Generate all required icon sizes
const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon.png', size: 32 },
  { name: 'icon.png', size: 512 }, // Main icon
];

const iconsDir = join(__dirname, '..', 'public', 'icons');

// Create directory if it doesn't exist
try {
  mkdirSync(iconsDir, { recursive: true });
} catch (e) {
  // Directory already exists
}

console.log('Generating icons...');

sizes.forEach(({ name, size }) => {
  const iconBuffer = generateIcon(size);
  const filePath = join(iconsDir, name);
  writeFileSync(filePath, iconBuffer);
  console.log(`✓ Generated ${name} (${size}x${size})`);
});

console.log('\nAll icons generated successfully!');

