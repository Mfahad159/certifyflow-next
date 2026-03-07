const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walkDir(fullPath, callback);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            callback(fullPath);
        }
    });
}

function migrateFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace <Link to... with <Link href...
    content = content.replace(/<Link([^>]*?)to=/g, '<Link$1href=');

    // Replace useNavigate() with useRouter()
    // We'll capture the variable name
    let navVarMatch = content.match(/const\s+(\w+)\s*=\s*useNavigate\(\)/);
    let navVar = navVarMatch ? navVarMatch[1] : 'navigate';

    content = content.replace(/useNavigate\(\)/g, 'useRouter()');
    // replace the variable call with .push
    // e.g., navigate( -> router.push( or navigate( -> router.push(
    // If the variable was `navigate`, we replace `navigate(` with `navigate.push(`. Wait, Next.js useRouter returns router, but if we just change the hook: `const navigate = useRouter()`, then `navigate.push('/path')` works perfectly!
    if (navVarMatch) {
        let regex = new RegExp(`\\b${navVar}\\(`, 'g');
        content = content.replace(regex, `${navVar}.push(`);
    }

    // Handle imports
    if (content.includes('react-router-dom')) {
        let usesLink = content.includes('<Link');
        let usesRouter = content.includes('useRouter');
        let usesParams = content.includes('useParams');

        content = content.replace(/import\s+(?:\{[^}]*\}|[^;]*)\s+from\s+['"]react-router-dom['"];?/g, '');

        let newImports = '';
        if (usesLink) {
            newImports += "import Link from 'next/link';\n";
        }
        let navImports = [];
        if (usesRouter) navImports.push('useRouter');
        if (usesParams) navImports.push('useParams');

        if (navImports.length > 0) {
            newImports += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
        }

        if (newImports) {
            // to avoid duplicate imports if ran twice
            if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
                content = content.replace(/^(["']use client["'];?\s*)/, `$1\n${newImports}`);
            } else {
                content = newImports + content;
            }
        }
    }

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Migrated:', filePath);
    }
}

walkDir('d:/SAAS_Certify/certifyflow-next/components', migrateFile);
