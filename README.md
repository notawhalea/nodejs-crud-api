A simple CRUD API implementation in Node.JS using in-memory database.

## Prerequisites

- Node.js version 22.x.x (22.14.0 or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Navigate to the project directory:

```bash
cd nodejs-crud-api
```

3. Install dependencies:

```bash
npm install
```

4. Create .env file in the root directory and add:

```bash
PORT=4000
```

## Running the Application

The application can be run in different modes:

### Development Mode

```bash
npm run start:dev
```

Runs the server using ts-node-dev with hot reload.

### Production Mode

```bash
npm run start:prod
```

### Cluster Mode

```bash
npm run start:multi
```
## Testing

Run tests:

```bash
npm run test
```
