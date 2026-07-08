const http = require('http');

const req = http.request('http://localhost:5000/api/notes', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
}, (res) => {
  console.log('Status:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
});

req.on('error', console.error);
req.write(JSON.stringify({
  title: 'Test Note',
  content: 'Hello World',
  isPinned: false
}));
req.end();
