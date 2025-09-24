const fs = require('fs');
const path = require('path');

// Get all admin files
const adminDir = path.join(__dirname, 'pages/admin');
const files = fs.readdirSync(adminDir).filter(file => file.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if the file has the AdminLayout pattern and is missing the closing div
  if (content.includes('<AdminLayout>') && content.includes('    </AdminLayout>')) {
    // Look for the pattern where AdminLayout closes without the container div
    const pattern = /(\s+)<\/AdminLayout>\s*\)\s*}/;
    const match = content.match(pattern);
    
    if (match) {
      // Add the missing closing div
      const replacement = match[1] + '</div>\n' + match[1] + '</AdminLayout>\n  )\n}';
      content = content.replace(pattern, replacement);
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${file}`);
    } else {
      console.log(`Skipped: ${file} (pattern not found)`);
    }
  } else {
    console.log(`Skipped: ${file} (no AdminLayout or already correct)`);
  }
});

console.log('Done fixing all closing tags!');
