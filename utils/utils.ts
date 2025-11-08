import { IncomingMessage } from 'http';

export const parseBody = (req: IncomingMessage): Promise<any> => {
    return new Promise((resolve, reject) => {
        let body: string = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            if (!body) {
                return resolve({});
            }
            try {
                resolve(JSON.parse(body));
            } catch (error) {
                reject(new SyntaxError('Invalid JSON format'));
            }
        });

        req.on('error', (err) => {
            reject(err);
        });
    });
};