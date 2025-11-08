import { User, UserDTO } from './user.model';
import { v4 as uuidv4 } from 'uuid';
import { validate as uuidValidate } from 'uuid';

let users: User[] = [];

export const setAll = (newUsers: User[]): void => {
    users = newUsers;
};

export const findAll = (): User[] => {
    return users;
};

export const findById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
};

export const create = (userData: UserDTO): User => {
    const newUser: User = {
        id: uuidv4(),
        ...userData,
    };
    users.push(newUser);

    return newUser;
};

export const update = (id: string, userData: UserDTO): User | undefined => {
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

export const remove = (id: string): boolean => {
    const initialLength = users.length;
    users = users.filter(u => u.id !== id);
    return users.length < initialLength;
};

export const isValidUuid = (id: string): boolean => {
    return uuidValidate(id);
};