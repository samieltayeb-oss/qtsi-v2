const fs = require('fs');
const files = ['index.html', 'ai-governance.html', 'executive-advisory.html', 'academy.html'];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/src="\/qtsi-logo\.webp"/g, 'src="/qtsi-logo.png"');
  fs.writeFileSync(f, c);
});
console.log('Logo reverted to PNG');
