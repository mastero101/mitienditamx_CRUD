# MiTienditaMX API

This repository contains the backend API for MiTienditaMX, which provides CRUD operations for items and users.

## Setup

1. Install dependencies:
bash npm install

2. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add the following variables:
 PORT=3000
 DB_HOST=your_database_host
 DB_USER=your_database_user
 DB_PASSWORD=your_database_password
 DB_NAME=your_database_name
 JWT_SECRET=your_jwt_secret
 
3. Start the server:
bash node server.js

## API Endpoints

### Items

- `GET /items`: Get all items
- `GET /items/:item`: Search items by name
- `POST /items`: Register a new item
- `PUT /items/:id`: Update an existing item

### Users

- `GET /users`: Get all users
- `GET /users/:id`: Get a user by ID
- `POST /users`: Register a new user
- `PUT /users/:id/addresses`: Add a new address to a user
- `POST /login`: User login

### API Documentation

The API documentation is available at `/api-docs` using Swagger UI.

## Technologies Used

- Express.js
- Swagger
- Bcrypt
- JSON Web Tokens (JWT)
- dotenv
- MySQL2
- Sequelize

Feel free to explore the code for more details.
