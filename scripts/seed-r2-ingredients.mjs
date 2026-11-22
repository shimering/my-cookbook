import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ingredientsDir = path.resolve('public/ingredients');
const files = fs.readdirSync(ingredientsDir).filter(f => f.endsWith('.svg'));

console.log(`Found ${files.length} ingredient SVGs to upload to Cloudflare R2 (remote)...`);

for (const file of files) {
  const filePath = path.join(ingredientsDir, file);
  const r2Key = `ingredients/${file}`;
  console.log(`Uploading ${file} -> my-cookbook-assets/${r2Key} (--remote)...`);
  try {
    execSync(
      `npx.cmd wrangler r2 object put "my-cookbook-assets/${r2Key}" --file="${filePath}" --content-type="image/svg+xml" --remote`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.error(`Failed uploading ${file}:`, err.message);
    process.exit(1);
  }
}

console.log('✨ All 16 ingredient SVGs successfully uploaded to Cloudflare R2 (remote)!');
