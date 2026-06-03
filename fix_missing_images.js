const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const localImagesDir = path.join(dir, 'images');
const localImages = fs.readdirSync(localImagesDir).filter(f => f.endsWith('.webp') || f.endsWith('.jpg') || f.endsWith('.png'));

let imgIndex = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');

    // Find all src="images/..." and src="images/contact images/..."
    content = content.replace(/src="images\/([^"]+)"/g, (match, imagePath) => {
        // If it's a contact image, we already verified that part is fine
        if (imagePath.startsWith('contact images/')) {
            const contactImagePath = path.join(localImagesDir, imagePath);
            if (fs.existsSync(contactImagePath)) {
                return match;
            }
        }
        
        // It's a standard image. Check if it exists
        const fullImagePath = path.join(localImagesDir, imagePath);
        if (!fs.existsSync(fullImagePath)) {
            // It doesn't exist! Let's replace it with a valid local image
            // We can url encode spaces just in case, but usually we just use the name
            const newImage = localImages[imgIndex % localImages.length];
            imgIndex++;
            // Note: encoding spaces so they work in all browsers
            const encodedName = newImage.replace(/ /g, '%20');
            return `src="images/${encodedName}"`;
        }

        // Space encoding for existing ones just in case
        if (imagePath.includes(' ')) {
            const encodedName = imagePath.replace(/ /g, '%20');
            return `src="images/${encodedName}"`;
        }

        return match;
    });

    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`Updated missing images in ${file}`);
});
