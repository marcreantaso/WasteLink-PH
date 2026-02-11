const fs = require('fs');
const path = require('path');

const screensDir = path.join('src', 'screens');
const componentsDir = path.join('src', 'components');

function fixImports(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        if (!file.endsWith('.js')) return;

        const filePath = path.join(dir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Fix imports: ../../ -> ../
        // We target specific key modules to avoid treating external modules (if any weird ones exist) incorrectly, 
        // but specific folder references are safe.

        let newContent = content
            .replace(/from '\.\.\/\.\.\/theme'/g, "from '../theme'")
            .replace(/from '\.\.\/\.\.\/components\//g, "from '../components/")
            .replace(/from '\.\.\/\.\.\/context\//g, "from '../context/")
            .replace(/from '\.\.\/\.\.\/services\//g, "from '../services/")
            .replace(/from '\.\.\/\.\.\/i18n\//g, "from '../i18n/");

        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent);
            console.log(`Fixed imports in ${file}`);
        }
    });
}

fixImports(screensDir);
fixImports(componentsDir);
