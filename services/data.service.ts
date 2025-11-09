import { User, UserDTO } from '../models/user.model';
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';

let users: User[] = [];

export const findAll = (): User[] => {
    return users;
};

export const setAll = (newUsers: User[]): void => {
    users = newUsers;
};

export const findById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
};

export let create = (userData: UserDTO): User => {
    const newUser: User = {
        id: uuidv4(),
        ...userData,
    };
    users.push(newUser);

    return newUser;
};

export let update = (id: string, userData: UserDTO): User | undefined => {
    const index = users.findIndex(u => u.id === id);
    if (index === -1) {
        return undefined;
    }

    const updatedUser: User = {
        id: id,
        ...userData,
    };

    users[index] = updatedUser;
    return updatedUser;
};

export let remove = (id: string): boolean => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    return users.length < initialLength;
};

export const isValidUuid = (id: string): boolean => {
    return uuidValidate(id);
};