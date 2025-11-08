import { IncomingMessage, ServerResponse } from 'http';
import { User, UserDTO } from '../models/user.model';
import * as DataService from '../services/data.service';
import { parseBody } from '../utils/utils';

const sendResponse = (res: ServerResponse, statusCode: number, data: any) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
};

export const getUsers = (req: IncomingMessage, res: ServerResponse): void => {
    try {
        const users: User[] = DataService.findAll();
        sendResponse(res, 200, users);
    } catch (error) {
        console.error('Error fetching users:', error);
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
};

export const getUser = (req: IncomingMessage, res: ServerResponse, userId: string): void => {
    try {
        if (!DataService.isValidUuid(userId)) {
            sendResponse(res, 400, { message: 'User ID is invalid (must be a valid UUID)' });
            return;
        }

        const user: User | undefined = DataService.findById(userId);

        if (!user) {
            sendResponse(res, 404, { message: 'User not found' });
            return;
        }

        sendResponse(res, 200, user);
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
};

export const createUser = async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    try {
        const body: any = await parseBody(req);

        if (!body.username || typeof body.username !== 'string' ||
            !body.age || typeof body.age !== 'number' ||
            !body.hobbies || !Array.isArray(body.hobbies) || body.hobbies.some((h: any) => typeof h !== 'string')) {

            sendResponse(res, 400, { message: 'Required fields (username: string, age: number, hobbies: string[]) are missing or have invalid types' });
            return;
        }

        const userData: UserDTO = {
            username: body.username,
            age: body.age,
            hobbies: body.hobbies as string[],
        };

        const newUser: User = DataService.create(userData);

        sendResponse(res, 201, newUser);
    } catch (error) {
        console.error('Error creating user:', error);
        if (error instanceof SyntaxError) {
            sendResponse(res, 400, { message: 'Invalid JSON format in request body' });
        } else {
            sendResponse(res, 500, { message: 'Internal Server Error' });
        }
    }
};

export const updateUser = async (req: IncomingMessage, res: ServerResponse, userId: string): Promise<void> => {
    try {
        if (!DataService.isValidUuid(userId)) {
            sendResponse(res, 400, { message: 'User ID is invalid (must be a valid UUID)' });
            return;
        }

        let user: User | undefined = DataService.findById(userId);
        if (!user) {
            sendResponse(res, 404, { message: 'User not found' });
            return;
        }

        const body: any = await parseBody(req);

        if (!body.username || typeof body.username !== 'string' ||
            !body.age || typeof body.age !== 'number' ||
            !body.hobbies || !Array.isArray(body.hobbies) || body.hobbies.some((h: any) => typeof h !== 'string')) {

            sendResponse(res, 400, { message: 'Required fields (username: string, age: number, hobbies: string[]) are missing or have invalid types' });
            return;
        }

        const userData: UserDTO = {
            username: body.username,
            age: body.age,
            hobbies: body.hobbies as string[],
        };

        user = DataService.update(userId, userData);

        if (user) {
            sendResponse(res, 200, user);
        } else {
            sendResponse(res, 404, { message: 'User not found during update' });
        }

    } catch (error) {
        console.error(`Error updating user ${userId}:`, error);
        if (error instanceof SyntaxError) {
            sendResponse(res, 400, { message: 'Invalid JSON format in request body' });
        } else {
            sendResponse(res, 500, { message: 'Internal Server Error' });
        }
    }
};

export const deleteUser = (req: IncomingMessage, res: ServerResponse, userId: string): void => {
    try {
        if (!DataService.isValidUuid(userId)) {
            sendResponse(res, 400, { message: 'User ID is invalid (must be a valid UUID)' });
            return;
        }

        const deleted: boolean = DataService.remove(userId);

        if (deleted) {
            sendResponse(res, 204, null);
            return;
        }

        sendResponse(res, 404, { message: 'User not found' });
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        sendResponse(res, 500, { message: 'Internal Server Error' });
    }
};