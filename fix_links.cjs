const fs = require('fs');
const files = ['index.html', 'ai-governance.html', 'executive-advisory.html', 'academy.html'];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/src="\/qtsi-logo\.png"/g, 'src="/qtsi-logo.webp"');
  c = c.replace(/href="#procurement"/g, 'href="/#procurement"');
  c = c.replace(/href="#about"/g, 'href="/#about"');
  c = c.replace(/href="#contact"/g, 'href="/#contact"');
  c = c.replace(/href="#booking"/g, 'href="/#booking"');
  fs.writeFileSync(f, c);
});
console.log('Links and logo fixed');
