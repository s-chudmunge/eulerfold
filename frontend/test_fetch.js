const http = require('http');

const options = {
  hostname: 'localhost',
  port: 8000,
  path: '/api/roadmaps/get',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed.roadmap.plan.modules[0].topics, null, 2));
    } catch (e) {
      console.error(e);
    }
  });
});

req.on('error', (e) => {
  console.error(e);
});

req.write(JSON.stringify({ identifier: 'computer-vision-from-fundamentals-to-research-frontiers' }));
req.end();
