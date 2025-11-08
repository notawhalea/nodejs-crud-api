import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from './user.controller';

const PORT: number = parseInt(process.env.PORT || '4000', 10);

const server = http.createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '/';
    const method = req.method;

    const urlParts = url.split('/').filter(p => p.length > 0);

    if (urlParts[0] === 'api' && urlParts[1] === 'users') {
        if (urlParts.length === 2) {
            switch (method) {
                case 'GET':
                    getUsers(req, res);
                    break;
                case 'POST':
                    await createUser(req, res);
                    break;
                default:
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
                    break;
            }
            return;
        }

        if (urlParts.length === 3) {
            const userId = urlParts[2];
            switch (method) {
                case 'GET':
                    getUser(req, res, userId);
                    break;
                case 'PUT':
                    await updateUser(req, res, userId);
                    break;
                case 'DELETE':
                    deleteUser(req, res, userId);
                    break;
                default:
                    res.writeHead(405, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Method Not Allowed' }));
                    break;
            }
            return;
        }
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Endpoint Not Found' }));
});

server.listen(PORT, () => {
    console.log(`Server started and listening on port ${PORT}`);
});

server.on('error', (err: NodeJS.ErrnoException) => {
    console.error('Server error:', err);
});