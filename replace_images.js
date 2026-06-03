const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const localImagesDir = path.join(dir, 'images');
const localImages = fs.readdirSync(localImagesDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));
const contactImagesDir = path.join(localImagesDir, 'contact images');
const contactImages = fs.readdirSync(contactImagesDir).filter(f => f.endsWith('.webp'));

let defaultImageIndex = 0;
let contactImageIndex = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // 1. Replace nav logo (A tag)
    content = content.replace(
        /<a href="index\.html" class="nav-logo">Stackly<\/a>/g,
        '<a href="index.html" class="nav-logo"><img src="whitelogo.webp" alt="Stackly" style="height: 24px;"></a>'
    );
    // Nav logo (DIV tag)
    content = content.replace(
        /<div class="nav-logo">Stackly<\/div>/g,
        '<div class="nav-logo"><img src="whitelogo.webp" alt="Stackly" style="height: 24px;"></div>'
    );
    
    // Auth pages logo (class="logo")
    content = content.replace(
        /<a href="index\.html" class="logo">Stackly<\/a>/g,
        '<a href="index.html" class="logo"><img src="whitelogo.webp" alt="Stackly" style="height: 32px; display: block; margin: 0 auto;"></a>'
    );
    
    // Dashboard logo (class="sidebar-logo")
    content = content.replace(
        /<a href="index\.html" class="sidebar-logo"[^>]*>Stackly<\/a>/g,
        (match) => {
            const openTag = match.substring(0, match.indexOf('>') + 1);
            return `${openTag}<img src="whitelogo.webp" alt="Stackly" style="height: 24px;"></a>`;
        }
    );

    // 2. Replace footer logo
    content = content.replace(
        /<h3>Stackly<\/h3>/g,
        '<img src="whitelogo.webp" alt="Stackly" style="height: 32px; margin-bottom: 16px;">'
    );

    // 3. Replace unsplash links
    content = content.replace(/src="https:\/\/images\.unsplash\.com\/([^"?]+)[^"]*"/g, (match, photoId) => {
        // Is it a person/avatar?
        // Let's guess based on surrounding context or just if it's small? We don't have context here easily.
        // But we can check if it has "w=100" or "w=200" or "w=150" in the original match, which usually means avatar.
        // Wait, the prompt says "and in contact and person images use contact images".
        // It's safer to use the 'contact images' if we see w=100, w=200, or w=600 (team members in about.html are w=600).
        // Let's check team members in about.html: They are w=600, w=400, etc? 
        // In about.html team members: w=600, class="team-card-img". 
        // In blog.html author avatars: w=100.
        // We can just use contactImages for everything that looks like a person.
        
        const isAvatar = match.includes('w=100') || match.includes('w=200') || match.includes('w=150');
        const isTeamCard = file === 'about.html' && match.includes('w=600');
        
        if (isAvatar || isTeamCard) {
            const img = contactImages[contactImageIndex % contactImages.length];
            contactImageIndex++;
            return `src="images/contact images/${img}"`;
        }

        // Try to match the exact ID if we have it locally
        const exactMatch = localImages.find(img => img.includes(photoId));
        if (exactMatch) {
            return `src="images/${exactMatch}"`;
        }
        
        // Otherwise, use a generic local image
        const img = localImages[defaultImageIndex % localImages.length];
        defaultImageIndex++;
        return `src="images/${img}"`;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated ${file}`);
});
