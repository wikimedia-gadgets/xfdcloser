const http = require('http');
const fs = require('fs');

const hostname = '127.0.0.1';
const port = 8125;

const server = http.createServer((request, response) => {
	const filePath = '.' + request.url
	const contentType = "text/javascript";
	fs.readFile(filePath, function(error, content) {
		if (error) {
			response.writeHead(error.code == 'ENOENT' ? 404 : 500);
			response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
		} else {
			response.writeHead(200, { 'Content-Type': contentType });
			response.end(content, 'utf-8');
		}
	});
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});