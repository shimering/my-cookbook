import fs from 'fs';
import path from 'path';

const outDir = path.resolve('public/ingredients');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const icons = {
  'flour.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Flour sack bag -->
  <path d="M18 20 C18 16, 46 16, 46 20 L50 52 C50 56, 14 56, 14 52 Z" fill="#FFF9E6" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Folded top tie -->
  <path d="M22 20 C22 14, 42 14, 42 20 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="2"/>
  <ellipse cx="32" cy="15" rx="6" ry="3" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Wheat sprig on bag -->
  <path d="M32 28 L32 46" stroke="#4A2C2A" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M32 32 C28 30, 26 27, 28 26 C30 29, 32 30, 32 32 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <path d="M32 32 C36 30, 38 27, 36 26 C34 29, 32 30, 32 32 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <path d="M32 38 C28 36, 26 33, 28 32 C30 35, 32 36, 32 38 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <path d="M32 38 C36 36, 38 33, 36 32 C34 35, 32 36, 32 38 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <!-- Flour dust sparkles -->
  <circle cx="20" cy="38" r="1.5" fill="#FFE599"/>
  <circle cx="44" cy="42" r="1.5" fill="#FFE599"/>
</svg>`,

  'sugar.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Sugar bowl -->
  <path d="M14 28 C14 46, 50 46, 50 28 Z" fill="#FFF5F7" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Bowl Rim -->
  <ellipse cx="32" cy="28" rx="18" ry="5" fill="#FFE599" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Sugar mound -->
  <path d="M18 28 C22 20, 42 20, 46 28 Z" fill="#FFFFFF" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Little spoon resting -->
  <path d="M34 26 L48 12 C50 10, 54 14, 52 16 L38 30 Z" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1.5"/>
  <circle cx="51" cy="13" r="2.5" fill="#FFE599"/>
  <!-- Sugar sparkles -->
  <path d="M26 23 L28 25 M28 23 L26 25" stroke="#4A2C2A" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M36 21 L38 23 M38 21 L36 23" stroke="#4A2C2A" stroke-width="1.2" stroke-linecap="round"/>
</svg>`,

  'butter.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Butter dish base -->
  <path d="M10 46 C10 42, 54 42, 54 46 C54 50, 10 50, 10 46 Z" fill="#FFF5F7" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Butter block (isometric block) -->
  <!-- Top face -->
  <polygon points="20,24 44,24 50,29 26,29" fill="#FFF2B2" stroke="#4A2C2A" stroke-width="1.8" stroke-linejoin="round"/>
  <!-- Front face -->
  <polygon points="20,24 26,29 26,43 20,38" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.8" stroke-linejoin="round"/>
  <!-- Right face -->
  <polygon points="26,29 50,29 50,43 26,43" fill="#FFDA73" stroke="#4A2C2A" stroke-width="1.8" stroke-linejoin="round"/>
  <!-- Melting drip -->
  <path d="M36 43 C36 47, 40 47, 40 43 Z" fill="#FFDA73" stroke="#4A2C2A" stroke-width="1.2"/>
  <circle cx="45" cy="45" r="1.5" fill="#FFE599"/>
</svg>`,

  'eggs.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Back whole egg -->
  <ellipse cx="24" cy="34" rx="12" ry="16" transform="rotate(-15 24 34)" fill="#FFEED1" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Front egg with cracked yolk -->
  <ellipse cx="40" cy="38" rx="13" ry="15" transform="rotate(20 40 38)" fill="#FFF9E6" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Cute little yolk -->
  <circle cx="39" cy="39" r="6" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.5"/>
  <circle cx="37" cy="37" r="1.5" fill="#FFFFFF"/>
</svg>`,

  'milk.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Milk bottle -->
  <path d="M25 18 L25 14 L39 14 L39 18 L44 26 L44 50 C44 53, 20 53, 20 50 L20 26 Z" fill="#FFFFFF" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Bottle cap -->
  <rect x="23" y="10" width="18" height="4" rx="1.5" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Milk wave fill -->
  <path d="M21 34 Q 32 38, 43 34 L43 49 C43 51, 21 51, 21 49 Z" fill="#FFF0F3"/>
  <!-- Strawberry patch on bottle -->
  <path d="M29 39 C29 35, 35 35, 35 39 C35 43, 32 45, 32 45 C32 45, 29 43, 29 39 Z" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1.2"/>
  <circle cx="32" cy="36" r="1" fill="#FFE599"/>
</svg>`,

  'berries.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Strawberry -->
  <path d="M24 22 C15 22, 14 36, 24 48 C34 36, 33 22, 24 22 Z" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Strawberry leaves -->
  <path d="M24 22 L20 16 M24 22 L24 14 M24 22 L28 16" stroke="#4A2C2A" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Strawberry seeds -->
  <circle cx="21" cy="29" r="1" fill="#FFE599"/>
  <circle cx="27" cy="30" r="1" fill="#FFE599"/>
  <circle cx="24" cy="36" r="1" fill="#FFE599"/>
  <circle cx="24" cy="42" r="0.8" fill="#FFE599"/>
  <!-- Blueberries -->
  <circle cx="42" cy="38" r="9" fill="#7C8DB5" stroke="#4A2C2A" stroke-width="2"/>
  <circle cx="42" cy="35" r="2.5" fill="#4A2C2A"/>
  <circle cx="48" cy="26" r="7" fill="#95A5CC" stroke="#4A2C2A" stroke-width="1.8"/>
  <circle cx="47" cy="24" r="2" fill="#4A2C2A"/>
</svg>`,

  'cinnamon.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Cinnamon sticks crossed -->
  <g transform="rotate(25 32 32)">
    <rect x="18" y="26" width="28" height="8" rx="3" fill="#D7A174" stroke="#4A2C2A" stroke-width="2"/>
    <ellipse cx="18" cy="30" rx="2" ry="4" fill="#C48858" stroke="#4A2C2A" stroke-width="1.5"/>
    <path d="M22 28 C26 29, 38 29, 44 28" stroke="#4A2C2A" stroke-width="1" stroke-linecap="round"/>
  </g>
  <g transform="rotate(-20 32 32)">
    <rect x="18" y="30" width="28" height="8" rx="3" fill="#C48858" stroke="#4A2C2A" stroke-width="2"/>
    <ellipse cx="46" cy="34" rx="2" ry="4" fill="#A86E42" stroke="#4A2C2A" stroke-width="1.5"/>
    <path d="M20 32 C26 33, 38 33, 44 32" stroke="#4A2C2A" stroke-width="1" stroke-linecap="round"/>
  </g>
  <!-- Little spice star sparkle -->
  <circle cx="48" cy="18" r="2" fill="#FFE599"/>
  <circle cx="16" cy="46" r="1.5" fill="#FF8FA3"/>
</svg>`,

  'garlic.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Plump garlic bulb -->
  <path d="M32 14 C32 14, 20 22, 18 36 C16 48, 26 52, 32 52 C38 52, 48 48, 46 36 C44 22, 32 14, 32 14 Z" fill="#FFF9E6" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Bulb cloves lines -->
  <path d="M32 14 C27 24, 24 38, 25 51" stroke="#4A2C2A" stroke-width="1.5"/>
  <path d="M32 14 C37 24, 40 38, 39 51" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Top stem twist -->
  <path d="M32 14 C30 10, 33 6, 35 6" stroke="#4A2C2A" stroke-width="2" stroke-linecap="round"/>
  <!-- Gentle blush on cheek -->
  <ellipse cx="23" cy="38" rx="3" ry="2" fill="#FF8FA3" opacity="0.6"/>
  <ellipse cx="41" cy="38" rx="3" ry="2" fill="#FF8FA3" opacity="0.6"/>
</svg>`,

  'pasta.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Farfalle / Bow-tie pasta -->
  <path d="M16 22 L28 30 L16 38 C14 34, 14 26, 16 22 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <path d="M48 22 L36 30 L48 38 C50 34, 50 26, 48 22 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Center pinch knot -->
  <rect x="28" y="27" width="8" height="6" rx="2" fill="#FFDA73" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Pasta ridges -->
  <path d="M19 25 L26 29 M19 35 L26 31" stroke="#4A2C2A" stroke-width="1.2" stroke-linecap="round"/>
  <path d="M45 25 L38 29 M45 35 L38 31" stroke="#4A2C2A" stroke-width="1.2" stroke-linecap="round"/>
  <!-- Little herb leaf -->
  <circle cx="32" cy="46" r="2" fill="#81C784"/>
</svg>`,

  'maple-syrup.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Maple syrup jug/bottle -->
  <path d="M28 16 L28 20 C22 24, 20 32, 20 44 C20 50, 44 50, 44 44 C44 32, 42 24, 36 20 L36 16 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Jug side handle -->
  <path d="M21 26 C15 27, 15 36, 21 38" stroke="#4A2C2A" stroke-width="2" stroke-linecap="round"/>
  <!-- Bottle cap -->
  <rect x="26" y="11" width="12" height="5" rx="1.5" fill="#C48858" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Amber syrup level -->
  <path d="M21 32 C26 30, 38 34, 43 32 L43 45 C43 49, 21 49, 21 45 Z" fill="#E89B58"/>
  <!-- Maple leaf badge on bottle -->
  <path d="M32 34 L30 38 L32 37 L34 38 Z" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1"/>
  <path d="M32 37 L32 41" stroke="#4A2C2A" stroke-width="1" stroke-linecap="round"/>
</svg>`,

  'salt.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Salt shaker -->
  <path d="M22 24 L20 48 C20 52, 44 52, 44 48 L42 24 Z" fill="#FFF5F7" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Metal shaker top -->
  <path d="M24 24 C24 16, 40 16, 40 24 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Shaker holes -->
  <circle cx="28" cy="20" r="1" fill="#4A2C2A"/>
  <circle cx="32" cy="18" r="1" fill="#4A2C2A"/>
  <circle cx="36" cy="20" r="1" fill="#4A2C2A"/>
  <!-- "S" monogram or salt heart -->
  <path d="M32 34 C30 31, 26 33, 28 36 C30 39, 32 41, 32 41 C32 41, 34 39, 36 36 C38 33, 34 31, 32 34 Z" fill="#FF8FA3"/>
</svg>`,

  'baking-powder.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Powder Tin can -->
  <rect x="20" y="20" width="24" height="30" rx="3" fill="#FFF9E6" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Tin Lid -->
  <rect x="18" y="16" width="28" height="5" rx="1.5" fill="#FFE599" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Vintage label badge -->
  <rect x="23" y="27" width="18" height="15" rx="2" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="1.2"/>
  <line x1="26" y1="32" x2="38" y2="32" stroke="#FFFFFF" stroke-width="1.5" stroke-linecap="round"/>
  <line x1="28" y1="36" x2="36" y2="36" stroke="#FFFFFF" stroke-width="1.2" stroke-linecap="round"/>
</svg>`,

  'vanilla.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Vanilla Pods -->
  <path d="M16 48 C20 40, 36 24, 46 16 C48 14, 51 17, 49 19 C39 27, 23 43, 19 50 Z" fill="#6D4C41" stroke="#4A2C2A" stroke-width="1.8"/>
  <path d="M22 48 C26 42, 40 28, 48 22" stroke="#4A2C2A" stroke-width="1.8" stroke-linecap="round"/>
  <!-- Vanilla Blossom Flower -->
  <circle cx="34" cy="34" r="5" fill="#FFF9E6" stroke="#4A2C2A" stroke-width="1.5"/>
  <path d="M34 29 C34 25, 38 25, 38 29 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <path d="M34 39 C34 43, 38 43, 38 39 Z" fill="#FFE599" stroke="#4A2C2A" stroke-width="1.2"/>
  <circle cx="34" cy="34" r="2" fill="#FF8FA3"/>
</svg>`,

  'olive-oil.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Bottle shape -->
  <path d="M27 16 L27 21 C22 25, 20 31, 20 46 C20 51, 44 51, 44 46 C44 31, 42 25, 37 21 L37 16 Z" fill="#F4F8E8" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Cork stopper -->
  <rect x="28" y="11" width="8" height="5" rx="1.2" fill="#C48858" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Golden-olive oil fill -->
  <path d="M21 34 Q 32 32, 43 34 L43 47 C43 50, 21 50, 21 47 Z" fill="#DCE775"/>
  <!-- Olive twig on bottle -->
  <circle cx="32" cy="40" r="3" fill="#689F38" stroke="#4A2C2A" stroke-width="1"/>
  <path d="M32 37 C34 35, 36 36, 36 38" stroke="#4A2C2A" stroke-width="1" stroke-linecap="round"/>
</svg>`,

  'chocolate.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Chocolate bar partially wrapped -->
  <!-- Top unwrapped chocolate blocks -->
  <rect x="18" y="16" width="28" height="20" rx="2" fill="#5D4037" stroke="#4A2C2A" stroke-width="2"/>
  <!-- Chocolate grid lines -->
  <line x1="32" y1="16" x2="32" y2="36" stroke="#4A2C2A" stroke-width="1.5"/>
  <line x1="18" y1="26" x2="46" y2="26" stroke="#4A2C2A" stroke-width="1.5"/>
  <!-- Pink foil wrap -->
  <path d="M16 32 L48 30 L46 50 C46 53, 18 53, 18 50 Z" fill="#FF8FA3" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Inner gold foil corner -->
  <polygon points="18,32 26,31 22,36" fill="#FFE599" stroke="#4A2C2A" stroke-width="1"/>
</svg>`,

  'cheese.svg': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <!-- Wedge of cheese -->
  <!-- Top face -->
  <polygon points="14,34 46,18 52,28 20,44" fill="#FFE599" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Side face -->
  <polygon points="20,44 52,28 52,38 20,48" fill="#FFDA73" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Front face -->
  <polygon points="14,34 20,44 20,48 14,38" fill="#F0C850" stroke="#4A2C2A" stroke-width="2" stroke-linejoin="round"/>
  <!-- Cheese holes -->
  <ellipse cx="32" cy="32" rx="3" ry="2" fill="#FFDA73"/>
  <ellipse cx="42" cy="25" rx="2.5" ry="1.5" fill="#FFDA73"/>
  <ellipse cx="36" cy="40" rx="3" ry="2" fill="#F0C850"/>
</svg>`
};

for (const [filename, svg] of Object.entries(icons)) {
  fs.writeFileSync(path.join(outDir, filename), svg.trim(), 'utf-8');
  console.log(`Generated: ${filename}`);
}

console.log('All 16 SVGs generated successfully!');
