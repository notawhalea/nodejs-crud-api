import cluster from 'cluster';
import os from 'os';
import http from 'http';
import { createServer } from './server';
import * as DataServiceModule from './services/data.service';
let DataService = { ...DataServiceModule };

const numCPUs = os.availableParallelism() - 1;
const PORT = parseInt(process.env.PORT || '4000', 10);

if (cluster.isPrimary) {
    console.log(`Master ${process.pid} is running`);
    console.log(`Starting ${numCPUs} workers...`);

    const workers: number[] = [];
    for (let i = 1; i <= numCPUs; i++) {
        const workerPort = PORT + i;
        const worker = cluster.fork({ WORKER_PORT: workerPort });
        workers.push(workerPort);
    }

    let current = 0;

    const balancer = http.createServer((req, res) => {
        const targetPort = workers[current];
        current = (current + 1) % workers.length;

        const options = {
            hostname: 'localhost',
            port: targetPort,
            path: req.url,
            method: req.method,
            headers: req.headers
        };

        const proxy = http.request(options, proxyRes => {
            res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
            proxyRes.pipe(res, { end: true });
        });

        req.pipe(proxy, { end: true });

        proxy.on('error', (err) => {
            console.error('Proxy error:', err);
            res.writeHead(500);
            res.end('Internal Server Error');
        });
    });

    balancer.listen(PORT, () => {
        console.log(`Load balancer running on port ${PORT}`);
    });

    cluster.on('message', (worker, message) => {
        if (message.type === 'SYNC_USERS') {
            for (const id in cluster.workers) {
                if (cluster.workers[id] && cluster.workers[id]?.id !== worker.id) {
                    cluster.workers[id]?.send({ type: 'UPDATE_USERS', data: message.data });
                }
            }
        }
    });

} else {
    const workerPort = parseInt(process.env.WORKER_PORT!, 10);
    const server = createServer();

    process.on('message', (msg: any) => {
        if (msg.type === 'UPDATE_USERS') {
            DataService.setAll(msg.data);
        }
    });

    const sync = () => {
        process.send?.({ type: 'SYNC_USERS', data: DataService.findAll() });
    };

    const originalCreate = DataService.create.bind(DataService);
    const originalUpdate = DataService.update.bind(DataService);
    const originalRemove = DataService.remove.bind(DataService);

    DataService.create = (...args: Parameters<typeof originalCreate>) => {
        const result = originalCreate(...args);
        sync();
        return result;
    };

    DataService.update = (...args: Parameters<typeof originalUpdate>) => {
        const result = originalUpdate(...args);
        sync();
        return result;
    };

    DataService.remove = (...args: Parameters<typeof originalRemove>) => {
        const result = originalRemove(...args);
        sync();
        return result;
    };

    server.listen(workerPort, () => {
        console.log(`Worker ${process.pid} listening on port ${workerPort}`);
    });
}
