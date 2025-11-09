import { IncomingMessage, ServerResponse, createServer as createSrv, Server } from 'http';
import 'dotenv/config'
import {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser
} from './controllers/user.controller';

const PORT: number = parseInt(process.env.PORT || '4000', 10);

export const createServer = () => {
    const server: Server = createSrv(async (req: IncomingMessage, res: ServerResponse) => {
    const url = req.url || '/';
    const method = req.method;
    const urlParts = url.split('/').filter(p => p.length > 0);

    try {
        if (urlParts[0] === 'api' && urlParts[1] === 'users') {
            if (urlParts.length === 2) {
                switch (method) {
                    case 'GET':
                        await getUsers(req, res);
                        break;
                    case 'POST':
                        await createUser(req, res);
                        break;
                    default:
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Method Not Found' }));
                        break;
                }
                return;
            }

            if (urlParts.length === 3) {
                const userId = urlParts[2];
                switch (method) {
                    case 'GET':
                        await getUser(req, res, userId);
                        break;
                    case 'PUT':
                        await updateUser(req, res, userId);
                        break;
                    case 'DELETE':
                        await deleteUser(req, res, userId);
                        break;
                    default:
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Method Not Found' }));
                        break;
                }
                return;
            }
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Endpoint Not Found' }));
    } catch (error) {
        console.error('Unhandled request error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
});

    server.on('error', (err) => {
        console.error('Server error:', err);
    });

    return server;
};

export const server = createServer();

if (require.main === module) {
    server.listen(PORT, () => {
        console.log(`Server started and listening on port ${PORT}`);
    });
}