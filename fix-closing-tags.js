const fs = require('fs');
const path = require('path');

const adminFiles = [
  'pages/admin/analytics.tsx',
  'pages/admin/orders-new.tsx',
  'pages/admin/products-new.tsx',
  'pages/admin/notifications.tsx',
  'pages/admin/security.tsx',
  'pages/admin/media.tsx',
  'pages/admin/orders.tsx',
  'pages/admin/inventory.tsx',
  'pages/admin/products.tsx',
  'pages/admin/settings.tsx',
  'pages/admin/products-old.tsx'
];

adminFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file ends with the pattern that needs fixing
    if (content.includes('    </AdminLayout>\n  )\n}') && !content.includes('      </div>\n    </AdminLayout>')) {
      content = content.replace(
        '    </AdminLayout>\n  )\n}',
        '      </div>\n    </AdminLayout>\n  )\n}'
      );
      
      fs.writeFileSync(filePath, content);
      console.log(`Fixed: ${file}`);
    } else {
      console.log(`Skipped: ${file} (already correct or different pattern)`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});

console.log('Done fixing closing tags!');
