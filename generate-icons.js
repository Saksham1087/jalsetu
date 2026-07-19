const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

function drawWaterDrop(ctx, size) {
  const center = size / 2;
  const dropHeight = size * 0.65;
  const dropWidth = size * 0.55;
  const topY = center - dropHeight * 0.5;
  const bottomY = center + dropHeight * 0.5;

  // Main drop shape
  ctx.beginPath();
  ctx.moveTo(center, topY);
  ctx.bezierCurveTo(
    center - dropWidth * 0.5, topY + dropHeight * 0.3,
    center - dropWidth * 0.5, center + dropHeight * 0.1,
    center, bottomY
  );
  ctx.bezierCurveTo(
    center + dropWidth * 0.5, center + dropHeight * 0.1,
    center + dropWidth * 0.5, topY + dropHeight * 0.3,
    center, topY
  );
  
  const gradient = ctx.createLinearGradient(0, topY, size, bottomY);
  gradient.addColorStop(0, '#0ea5e9');
  gradient.addColorStop(1, '#0284c7');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Inner highlight
  ctx.beginPath();
  ctx.moveTo(center, topY + size * 0.1);
  ctx.bezierCurveTo(
    center - dropWidth * 0.3, topY + dropHeight * 0.25,
    center - dropWidth * 0.3, center,
    center, bottomY - size * 0.1
  );
  ctx.bezierCurveTo(
    center + dropWidth * 0.3, center,
    center + dropWidth * 0.3, topY + dropHeight * 0.25,
    center, topY + size * 0.1
  );
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.fill();

  // Wave accents
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = size * 0.015;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(center - size * 0.15, center);
  ctx.quadraticCurveTo(center, center - size * 0.1, center + size * 0.15, center);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = size * 0.012;
  ctx.beginPath();
  ctx.moveTo(center - size * 0.2, center + size * 0.1);
  ctx.quadraticCurveTo(center, center, center + size * 0.2, center + size * 0.1);
  ctx.stroke();
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = size * 0.008;
  ctx.beginPath();
  ctx.moveTo(center - size * 0.25, center + size * 0.2);
  ctx.quadraticCurveTo(center, center + size * 0.1, center + size * 0.25, center + size * 0.2);
  ctx.stroke();
}

async function generateIcons() {
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  for (const size of sizes) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    drawWaterDrop(ctx, size);
    
    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(iconsDir, `icon-${size}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`Generated ${filename} (${buffer.length} bytes)`);
  }
  
  // Generate shortcut icons (96px for manifest shortcuts)
  const shortcuts = [
    { name: 'report', color: '#0ea5e9', lightColor: '#38bdf8' },
    { name: 'map', color: '#22c55e', lightColor: '#4ade80' }
  ];
  
  for (const shortcut of shortcuts) {
    const size = 96;
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Background circle
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 * 0.85, 0, Math.PI * 2);
    const bgGradient = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2 * 0.85);
    bgGradient.addColorStop(0, shortcut.lightColor);
    bgGradient.addColorStop(1, shortcut.color);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    
    // Icon symbol
    ctx.fillStyle = 'white';
    
    if (shortcut.name === 'report') {
      // Plus sign for report
      const barW = size * 0.08;
      const barH = size * 0.35;
      ctx.fillRect(size/2 - barW/2, size/2 - barH/2, barW, barH);
      ctx.fillRect(size/2 - barH/2, size/2 - barW/2, barH, barW);
    } else {
      // Map pin for map
      ctx.beginPath();
      const pinTop = size/2 - size*0.18;
      const pinBottom = size/2 + size*0.18;
      ctx.moveTo(size/2, pinTop);
      ctx.bezierCurveTo(
        size/2 - size*0.12, pinTop + size*0.05,
        size/2 - size*0.12, size/2 + size*0.02,
        size/2, pinBottom
      );
      ctx.bezierCurveTo(
        size/2 + size*0.12, size/2 + size*0.02,
        size/2 + size*0.12, pinTop + size*0.05,
        size/2, pinTop
      );
      ctx.fill();
      // Inner circle
      ctx.beginPath();
      ctx.arc(size/2, size/2 - size*0.02, size*0.06, 0, Math.PI*2);
      ctx.fillStyle = shortcut.color;
      ctx.fill();
    }
    
    const buffer = canvas.toBuffer('image/png');
    const filename = path.join(iconsDir, `${shortcut.name}.png`);
    fs.writeFileSync(filename, buffer);
    console.log(`Generated ${filename} (${buffer.length} bytes)`);
  }
  
  // Generate maskable icon (512px with safe zone)
  const maskSize = 512;
  const canvas = createCanvas(maskSize, maskSize);
  const ctx = canvas.getContext('2d');
  drawWaterDrop(ctx, maskSize);
  // Add safe zone padding (maskable icons need 40% safe zone)
  const buffer = canvas.toBuffer('image/png');
  const maskFilename = path.join(iconsDir, 'icon-maskable-512.png');
  fs.writeFileSync(maskFilename, buffer);
  console.log(`Generated ${maskFilename} (${buffer.length} bytes)`);
  
  console.log('All icons generated successfully!');
}

generateIcons().catch(console.error);