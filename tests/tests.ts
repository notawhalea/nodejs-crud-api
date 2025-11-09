import { request } from 'http';
import * as assert from 'assert';
import 'dotenv/config';
import { server } from '../server';
import * as DataService from '../services/data.service';

const testUser = {
    username: 'TestUser',
    age: 30,
    hobbies: ['coding', 'reading'],
};

const updatedUser = {
    username: 'UpdatedTestUser',
    age: 31,
    hobbies: ['coding', 'writing', 'hiking'],
};

let createdUserId: string = '';
const PORT = parseInt(process.env.PORT || '4000', 10);

function makeRequest(method: string, path: string, data?: any): Promise<{ statusCode: number, body: any }> {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: '127.0.0.1',
            port: PORT,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data ? Buffer.byteLength(JSON.stringify(data)) : 0,
            },
        };

        const req = request(options, (res) => {
            let responseBody = '';
            res.on('data', (chunk) => {
                responseBody += chunk;
            });

            res.on('end', () => {
                try {
                    const parsedBody = responseBody ? JSON.parse(responseBody) : null;
                    resolve({ statusCode: res.statusCode || 500, body: parsedBody });
                } catch (e) {
                    console.error('Failed to parse JSON response:', responseBody);
                    resolve({ statusCode: res.statusCode || 500, body: responseBody }); // Возвращаем сырой текст при ошибке парсинга
                }
            });
        });

        req.on('error', (err) => {
            reject(err);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    let successCount = 0;
    let failCount = 0;

    console.log('--- Starting API Tests ---');

    try {
        console.log('1. Testing GET /api/users (Initial check)...');
        let res = await makeRequest('GET', '/api/users');
        assert.strictEqual(res.statusCode, 200, 'Status should be 200');
        assert.deepStrictEqual(res.body, [], 'Body should be an empty array');
        successCount++;

        console.log('2. Testing POST /api/users (Creation)...');
        res = await makeRequest('POST', '/api/users', testUser);
        assert.strictEqual(res.statusCode, 201, 'Status should be 201');
        assert.ok(res.body.id, 'Response must contain ID');
        assert.deepStrictEqual({ username: res.body.username, age: res.body.age, hobbies: res.body.hobbies }, testUser, 'User data must match input');
        createdUserId = res.body.id;
        successCount++;

        console.log('3. Testing GET /api/users/{userId} (Fetch by ID)...');
        res = await makeRequest('GET', `/api/users/${createdUserId}`);
        assert.strictEqual(res.statusCode, 200, 'Status should be 200');
        assert.strictEqual(res.body.id, createdUserId, 'Fetched ID must match created ID');
        successCount++;

        console.log('4. Testing PUT /api/users/{userId} (Update)...');
        res = await makeRequest('PUT', `/api/users/${createdUserId}`, updatedUser);
        assert.strictEqual(res.statusCode, 200, 'Status should be 200');
        assert.strictEqual(res.body.id, createdUserId, 'Updated ID must match created ID');
        assert.deepStrictEqual({ username: res.body.username, age: res.body.age, hobbies: res.body.hobbies }, updatedUser, 'User data must be updated');
        successCount++;

        console.log('5. Testing DELETE /api/users/{userId} (Deletion)...');
        res = await makeRequest('DELETE', `/api/users/${createdUserId}`);
        assert.strictEqual(res.statusCode, 204, 'Status should be 204');
        assert.strictEqual(res.body, null, 'Body should be null (No Content)');
        successCount++;

        console.log('6. Testing GET /api/users/{userId} (Check deletion)...');
        res = await makeRequest('GET', `/api/users/${createdUserId}`);
        assert.strictEqual(res.statusCode, 404, 'Status should be 404 (Not Found)');
        successCount++;

        const invalidUuid = 'invalid-uuid-format';
        const nonExistentUuid = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

        console.log('7. Testing GET /api/users/{invalidId} (400 Bad Request)...');
        res = await makeRequest('GET', `/api/users/${invalidUuid}`);
        assert.strictEqual(res.statusCode, 400, 'Status should be 400 for invalid UUID');
        successCount++;

        console.log('8. Testing GET /api/users/{nonExistentId} (404 Not Found)...');
        res = await makeRequest('GET', `/api/users/${nonExistentUuid}`);
        assert.strictEqual(res.statusCode, 404, 'Status should be 404 for non-existent UUID');
        successCount++;

    } catch (error) {
        failCount++;
        console.error('\n--- TEST FAILED ---');
        console.error(error);
        console.log('---------------------\n');
    } finally {
        server.close((err) => {
            if (err) console.error('Error closing server:', err);
            else console.log('Server closed successfully.');
        });
    }

    console.log('--- Test Summary ---');
    console.log(`Successful tests: ${successCount}`);
    console.log(`Failed tests: ${failCount}`);
    assert.strictEqual(failCount, 0, 'All tests must pass for successful completion!');
    console.log('ALL TESTS PASSED SUCCESSFULLY! ✅');
}

DataService.setAll([]);

server.listen(PORT, () => {
    console.log(`Test server listening on port ${PORT}`);
    runTests();
});

server.on('error', (err) => {
    console.error('Test server error:', err);
});