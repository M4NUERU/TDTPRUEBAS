import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const HEADER = `/**
 * © 2026 modulR. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL.
 * 
 * This file is part of modulR Manager.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 * Proprietary code by modulR.
 */

`;

const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css'];
const IGNORE_DIRS = ['node_modules', 'dist', '.git'];

function scanDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!IGNORE_DIRS.includes(file)) {
                scanDir(fullPath);
            }
        } else if (EXTENSIONS.includes(path.extname(file))) {
            addHeader(fullPath);
        }
    });
}

function addHeader(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');

        // Check if header already exists (simple check)
        if (content.includes('TodoTejidos SAS. All rights reserved')) {
            console.log(`Skipped: ${filePath} (Header already present)`);
            return;
        }

        // Handle 'use client' or imports at the very top?
        // Usually headers go at the very top.
        // But for 'use strict' or shebangs maybe not?
        // For this project (React/Vite), top is usually fine.

        fs.writeFileSync(filePath, HEADER + content);
        console.log(`Updated: ${filePath}`);
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Start from project root
const projectRoot = path.join(__dirname, '../src');
if (fs.existsSync(projectRoot)) {
    console.log(`Scanning ${projectRoot}...`);
    scanDir(projectRoot);
    console.log('Copyright headers applied successfully.');
} else {
    console.error('src directory not found!');
}
