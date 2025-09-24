const fs = require('fs');
const path = require('path');

// Get all admin files
const adminDir = path.join(__dirname, 'pages/admin');
const files = fs.readdirSync(adminDir).filter(file => file.endsWith('.tsx'));

files.forEach(file => {
  const filePath = path.join(adminDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix the pattern: remove extra closing divs before AdminLayout
  content = content.replace(/\s*<\/div>\s*<\/div>\s*<\/AdminLayout>/g, '\n    </AdminLayout>');
  
  // Fix the pattern: ensure proper structure
  content = content.replace(/(\s+)<\/div>\s*<\/div>\s*<\/AdminLayout>/g, '$1    </AdminLayout>');
  
  fs.writeFileSync(filePath, content);
  console.log(`Processed: ${file}`);
});

console.log('Done fixing all files!');
