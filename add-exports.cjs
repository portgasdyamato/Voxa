const fs = require('fs');
const path = require('path');

// Read the compiled API file
const apiFile = path.join(__dirname, 'api', 'index.js');
let content = fs.readFileSync(apiFile, 'utf8');

// Add the CommonJS exports at the end
content += '\nmodule.exports = handler;\nmodule.exports.default = handler;\n';

// Write back to the file
fs.writeFileSync(apiFile, content);

console.log('✅ Added CommonJS exports to api/index.js');
