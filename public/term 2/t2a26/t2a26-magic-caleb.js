const http = require('http');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <html>
        <head>
          <title>Magic Word</title>
        </head>
        <body>
          <h1>magic word</h1>
          <form method="POST">
            <input type="text" name="magic" value="fred" />
            <button type="submit">Submit</button>
          </form>
        </body>
      </html>
    `);
  } else if (req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      const parsed = querystring.parse(body);
      const input = parsed.magic || '';
      let message = '';
      if (input === 'fred') {
        message = 'magic word found';
      } else {
        message = 'try fred';
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html>
          <head>
            <title>Magic Word</title>
          </head>
          <body>
            <h1>magic word</h1>
            <p>${message}</p>
            <form method="POST">
              <input type="text" name="magic" value="${input}" />
              <button type="submit">Submit</button>
            </form>
          </body>
        </html>
      `);
    });
  } else {
    res.writeHead(405);
    res.end('Method Not Allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
