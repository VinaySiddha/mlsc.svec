const fs = require('fs');
const path = require('path');

const files = [
  'src/app/admin/analytics/page.tsx',
  'src/app/admin/community/page.tsx',
  'src/app/admin/internal-registration/page.tsx',
  'src/app/admin/interview-analytics/page.tsx',
  'src/app/admin/team/page.tsx',
  'src/app/admin/team/new/page.tsx',
  'src/app/admin/team/edit/[id]/page.tsx',
  'src/app/admin/team/categories/page.tsx',
  'src/app/admin/team/categories/new/page.tsx',
  'src/app/admin/team/categories/edit/[id]/page.tsx'
];

const basePath = 'D:/mlsc.svec/mlscsvec/mlsc.svec';

files.forEach(relPath => {
  const filePath = path.join(basePath, relPath);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes("userRole !== 'admin'")) {
    content = content.replace("userRole !== 'admin'", "userRole !== 'super_admin'");
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Successfully updated: ${relPath}`);
  } else {
    console.log(`No match found in: ${relPath}`);
  }
});
