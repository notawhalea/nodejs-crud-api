import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';

const PORT: number = parseInt(process.env.PORT || '4000', 10);

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
    res.setHeader('Content-Type', 'application/json');

    if (req.url === '/') {
        res.writeHead(200);
        res.end(JSON.stringify({ message: 'Welcome to the CRUD API!' }));
    } else {
        res.writeHead(404);
        res.end(JSON.stringify({ message: 'Not Found' }));
    }
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
});