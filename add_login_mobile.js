const fs = require('fs');
const path = require('path');

const files = ['index.html', 'about.html', 'services.html', 'blog.html', 'contact.html'];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add Login link to mobile menu
    if (!content.includes('>Login</a>') || !content.includes('href="login.html" onclick="toggleMenu()"')) {
        content = content.replace(
            /<a href="contact\.html" onclick="toggleMenu\(\)">Contact<\/a>/g, 
            '<a href="contact.html" onclick="toggleMenu()">Contact</a>\n            <a href="login.html" onclick="toggleMenu()">Login</a>'
        );
    }
    
    // Check if we need to add nth-child(6) to the CSS
    if (!content.includes('nth-child(6)')) {
        content = content.replace(
            /\.nav-menu-mobile\.active \.nav-links-mobile a:nth-child\(5\)\{transition-delay:0\.30s\}/g,
            '.nav-menu-mobile.active .nav-links-mobile a:nth-child(5){transition-delay:0.30s}\n        .nav-menu-mobile.active .nav-links-mobile a:nth-child(6){transition-delay:0.35s}'
        );
        content = content.replace(
            /\.nav-menu-mobile\.active \.nav-links-mobile a:nth-child\(5\) \{ transition-delay: 0\.30s; \}/g,
            '.nav-menu-mobile.active .nav-links-mobile a:nth-child(5) { transition-delay: 0.30s; }\n        .nav-menu-mobile.active .nav-links-mobile a:nth-child(6) { transition-delay: 0.35s; }'
        );
    }

    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
});
