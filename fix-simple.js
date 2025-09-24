const fs = require('fs');
const path = require('path');

// List of files that need fixing
const filesToFix = [
  'pages/admin/customers.tsx',
  'pages/admin/database.tsx',
  'pages/admin/inventory.tsx',
  'pages/admin/media.tsx',
  'pages/admin/notifications.tsx',
  'pages/admin/orders.tsx',
  'pages/admin/products.tsx',
  'pages/admin/security.tsx',
  'pages/admin/settings.tsx'
];

filesToFix.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Add the missing closing div before AdminLayout
    content = content.replace(
      '    </AdminLayout>\n  )\n}',
      '      </div>\n    </AdminLayout>\n  )\n}'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`Fixed: ${file}`);
  }
});

console.log('Done!');
