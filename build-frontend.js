import { spawnSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const frontendDir = path.join(__dirname, 'frontend');
const distDir = path.join(frontendDir, 'dist');
const outDir = path.join(__dirname, 'backend', 'public');

const run = (cmd, args, cwd) => {
  const result = spawnSync(cmd, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32'
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

const copyDir = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

run('npm', ['run', 'build'], frontendDir);

if (!fs.existsSync(distDir)) {
  console.error(`Frontend build chiqmadi: ${distDir}`);
  process.exit(1);
}

fs.rmSync(outDir, { recursive: true, force: true });
copyDir(distDir, outDir);

console.log(`Frontend build -> ${outDir}`);
