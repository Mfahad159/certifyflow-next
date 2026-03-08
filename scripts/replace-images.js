const fs = require('fs');
const path = require('path');

const targetDir = 'd:\\SAAS_Certify\\certifyflow-next\\components';

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    if (content.includes('<img src="/assest/logo.svg"')) {
        // Add import if not present
        if (!content.includes('import Image from "next/image"')) {
            content = 'import Image from "next/image";\n' + content;
        }
        content = content.replace(/<img\s+src="\/assest\/logo\.svg"\s+alt="([^"]*)"\s+className="([^"]*)"\s*\/>/g, '<Image src="/assest/logo.svg" alt="$1" className="$2" width={40} height={40} />');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Updated images in:', filePath);
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
console.log('Image replacements complete.');
