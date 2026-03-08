const fs = require('fs');
const path = require('path');

const targetDir = 'd:\\SAAS_Certify\\certifyflow-next\\components';

function replaceInFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('@/lib/supabase')) {
        const updated = content.replace(/@\/lib\/supabase(?!Client)/g, '@/lib/supabaseClient');
        fs.writeFileSync(filePath, updated, 'utf8');
        console.log('Updated:', filePath);
    }
}

function processDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (['.jsx', '.tsx', '.ts', '.js'].some(ext => file.endsWith(ext))) {
            replaceInFile(fullPath);
        }
    }
}

processDir(targetDir);
console.log('Done.');
