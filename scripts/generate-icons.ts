#!/usr/bin/env tsx

/**
 * Icon Generation Script
 * Generates PWA icons from SVG source
 *
 * Usage: npm run icons:generate
 *
 * Requirements: sharp library
 * Install: npm install --save-dev sharp
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface IconConfig {
  size: number;
  name: string;
  description: string;
}

// Check if required libraries are available
let sharp: typeof import('sharp') | null = null;
let pngToIco: typeof import('png-to-ico') | null = null;

try {
  sharp = (await import('sharp')).default;
} catch (error) {
  console.error('❌ Error: sharp library not found');
  console.error('Please install it with: npm install --save-dev sharp');
  process.exit(1);
}

try {
  pngToIco = (await import('png-to-ico')).default;
} catch (error) {
  console.error('❌ Error: png-to-ico library not found');
  console.error('Please install it with: npm install --save-dev png-to-ico');
  process.exit(1);
}

// Icon configurations
const icons: IconConfig[] = [
  {
    size: 192,
    name: 'icon-192.png',
    description: 'Android Chrome icon (192x192)',
  },
  {
    size: 512,
    name: 'icon-512.png',
    description: 'Android Chrome icon and splash screen (512x512)',
  },
  {
    size: 180,
    name: 'apple-touch-icon.png',
    description: 'iOS home screen icon (180x180)',
  },
  {
    size: 32,
    name: 'favicon-32.png',
    description: 'Favicon (32x32) - temporary for ICO generation',
  },
  {
    size: 16,
    name: 'favicon-16.png',
    description: 'Favicon (16x16) - temporary for ICO generation',
  },
];

// Paths
const publicDir = path.join(__dirname, '..', 'public');
const svgPath = path.join(publicDir, 'icon.svg');

/**
 * Generate PNG icons from SVG
 */
async function generateIcons(): Promise<void> {
  console.log('🎨 TDS Icon Generator\n');

  // Check if SVG source exists
  if (!fs.existsSync(svgPath)) {
    console.error(`❌ Error: SVG source not found at ${svgPath}`);
    console.error('Please create public/icon.svg first');
    process.exit(1);
  }

  // Ensure public directory exists
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  console.log(`📂 Source: ${svgPath}`);
  console.log(`📂 Output: ${publicDir}\n`);

  // Read SVG file
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate each icon
  for (const icon of icons) {
    try {
      const outputPath = path.join(publicDir, icon.name);

      await sharp!(svgBuffer)
        .resize(icon.size, icon.size, {
          fit: 'contain',
          background: { r: 26, g: 26, b: 46, alpha: 1 }, // TDS dark background
        })
        .png({
          quality: 100,
          compressionLevel: 9,
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      const sizeKB = (stats.size / 1024).toFixed(2);

      console.log(`✅ ${icon.name.padEnd(25)} ${icon.size}x${icon.size}  ${sizeKB} KB`);
      console.log(`   ${icon.description}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`❌ Failed to generate ${icon.name}:`, errorMessage);
    }
  }

  // Generate favicon.ico from PNG files
  console.log('\n🎨 Generating favicon.ico...');
  try {
    const favicon16Path = path.join(publicDir, 'favicon-16.png');
    const favicon32Path = path.join(publicDir, 'favicon-32.png');
    const faviconIcoPath = path.join(publicDir, 'favicon.ico');

    if (fs.existsSync(favicon16Path) && fs.existsSync(favicon32Path)) {
      const icoBuffer = await pngToIco!([favicon16Path, favicon32Path]);
      fs.writeFileSync(faviconIcoPath, icoBuffer);

      const stats = fs.statSync(faviconIcoPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ favicon.ico                 16x16, 32x32  ${sizeKB} KB`);
      console.log('   Browser tab icon (multi-size)');
    } else {
      console.error('❌ Failed to generate favicon.ico: PNG files not found');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`❌ Failed to generate favicon.ico:`, errorMessage);
  }

  // Clean up temporary favicon PNG files
  const tempFiles = ['favicon-16.png', 'favicon-32.png'];
  console.log('\n🧹 Cleaning up temporary files...');
  for (const file of tempFiles) {
    const filePath = path.join(publicDir, file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`   Deleted ${file}`);
    }
  }

  console.log('\n✨ Icon generation complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify icons in public/ directory');
  console.log('   2. Test PWA installation');
  console.log('   3. Check icons in browser tab and home screen');
  console.log('   4. Open public/icons-preview.html to preview all icons');
}

/**
 * Verify generated icons
 */
function verifyIcons(): void {
  console.log('\n🔍 Verifying generated icons...\n');

  const requiredIcons = [
    'icon-192.png',
    'icon-512.png',
    'apple-touch-icon.png',
    'favicon.ico',
  ];

  let allPresent = true;

  for (const icon of requiredIcons) {
    const iconPath = path.join(publicDir, icon);
    if (fs.existsSync(iconPath)) {
      const stats = fs.statSync(iconPath);
      const sizeKB = (stats.size / 1024).toFixed(2);
      console.log(`✅ ${icon.padEnd(25)} ${sizeKB} KB`);
    } else {
      console.log(`❌ ${icon.padEnd(25)} MISSING`);
      allPresent = false;
    }
  }

  if (allPresent) {
    console.log('\n✅ All required icons are present!');
  } else {
    console.log('\n⚠️  Some icons are missing. Run generation again.');
  }
}

/**
 * Display help information
 */
function showHelp(): void {
  console.log(`
TDS Icon Generator

Usage:
  npm run icons:generate          Generate all icons
  npm run icons:verify            Verify generated icons
  npm run icons:generate -- --help Show this help

Requirements:
  - sharp library (npm install --save-dev sharp)
  - public/icon.svg source file

Generated files:
  - icon-192.png (192x192) - Android Chrome
  - icon-512.png (512x512) - Android Chrome, splash screen
  - apple-touch-icon.png (180x180) - iOS home screen
  - favicon-16.png, favicon-32.png - For ICO conversion

For more information, see public/ICONS_README.md
  `);
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.includes('--verify') || args.includes('-v')) {
    verifyIcons();
  } else if (args.includes('--help') || args.includes('-h')) {
    showHelp();
  } else {
    await generateIcons();
    verifyIcons();
  }
}

// Run the script
main().catch(error => {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.error('\n❌ Error:', errorMessage);
  process.exit(1);
});
