const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const localImagesDir = path.join(dir, 'images');
const localImages = fs.readdirSync(localImagesDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));

let genericIndex = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Replace contact images except team section in about.html
    content = content.replace(/src="images\/contact images\/([^"]+)"/g, (match, filename, offset, fullString) => {
        const start = fullString.lastIndexOf('\n', offset);
        const end = fullString.indexOf('\n', offset);
        const line = fullString.substring(start, end);
        
        if (file === 'about.html' && line.includes('class="team-card-img"')) {
            return match; // Keep contact image
        }
        
        // Replace with a generic image
        const img = localImages[genericIndex % localImages.length];
        genericIndex++;
        return `src="images/${img}"`;
    });

    // 2. Turn stackly logo color to black (add filter: brightness(0))
    content = content.replace(/filter:\s*brightness\(0\);?\s*/g, '');
    
    content = content.replace(/(<img[^>]*src="whitelogo\.webp"[^>]*)style="([^"]*)"/g, (match, p1, p2) => {
        let newStyle = p2;
        if (!newStyle.includes('filter: brightness(0)')) {
            if (newStyle.trim().length > 0 && !newStyle.trim().endsWith(';')) {
                newStyle += ';';
            }
            newStyle += ' filter: brightness(0);';
        }
        return `${p1}style="${newStyle}"`;
    });

    // 3. Add Social in footer section
    if (content.includes('<div class="footer-grid">') || content.includes('<div class="footer-grid reveal">')) {
        if (!content.includes('<h4>Social</h4>')) {
            const socialCol = `
            <div class="footer-links">
                <h4>Social</h4>
                <a href="#">Twitter</a>
                <a href="#">LinkedIn</a>
                <a href="#">Instagram</a>
                <a href="#">YouTube</a>
            </div>`;
            
            // Insert it before the closing div of footer-grid
            content = content.replace(/(<div class="footer-links">\s*<h4>Company<\/h4>[\s\S]*?<\/div>\s*)(<\/div>\s*<div class="footer-bottom)/, `$1${socialCol}\n        $2`);
            
            // Update grid template columns for 5 columns instead of 4
            content = content.replace(/grid-template-columns:\s*2fr\s+1fr\s+1fr\s+1fr;/g, 'grid-template-columns: 2fr 1fr 1fr 1fr 1fr;');
        }
    }

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
});
