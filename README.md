# Notes App

## Overview

The Notes App is a simple web application designed for managing notes. It features user authentication, note creation, search functionality, and note management (archiving and trashing). The app is built using Node.js for the backend and vanilla JavaScript with HTML/CSS for the frontend.

## Features

- **User Authentication:** Sign up and log in to manage personal notes.
- **Create Notes:** Add new notes with title, content, tags, and a background color.
- **Search Notes:** Search for notes by title.
- **Manage Notes:** Archive and trash notes.
- **Responsive Design:** The UI is responsive and accessible on different devices.

## Installation

### Backend Setup

1. Clone the repository:
    ```bash
    git clone https://github.com/your-username/notes-app.git
    cd notes-app
    ```

2. Navigate to the backend directory:
    ```bash
    cd backend
    ```

3. Install the required dependencies:
    ```bash
    npm install
    ```

4. Set up environment variables:
    - Create a `.env` file in the `backend` directory.
    - Add the following variables to the `.env` file:
      ```plaintext
      MONGODB_URI=your_mongodb_uri
      JWT_SECRET=your_jwt_secret
      PORT=5000
      ```

5. Start the backend server:
    ```bash
    npm start
    ```

### Frontend Setup

1. Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```

2. (Optional) If you have a build tool or package manager setup, install dependencies:
    ```bash
    npm install
    ```

3. Open `index.html` in a browser to view the application.

## API Endpoints

- **POST /auth/signup**
  - **Description:** Register a new user.
  - **Request Body:** `{ "username": "string", "password": "string" }`
  - **Response:** Success or error message.

- **POST /auth/login**
  - **Description:** Log in and receive a JWT token.
  - **Request Body:** `{ "username": "string", "password": "string" }`
  - **Response:** `{ "token": "jwt_token" }`

- **GET /notes**
  - **Description:** Get all notes.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** List of notes.

- **GET /notes/archived**
  - **Description:** Get archived notes.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** List of archived notes.

- **GET /notes/trashed**
  - **Description:** Get trashed notes.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** List of trashed notes.

- **POST /notes**
  - **Description:** Create a new note.
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ "title": "string", "content": "string", "tags": ["string"], "backgroundColor": "string", "reminder": "ISO8601_date" }`
  - **Response:** Success or error message.

- **PUT /notes/:id**
  - **Description:** Update a note by ID.
  - **Headers:** `Authorization: Bearer <token>`
  - **Request Body:** `{ "title": "string", "content": "string", "tags": ["string"], "backgroundColor": "string", "reminder": "ISO8601_date" }`
  - **Response:** Success or error message.

- **DELETE /notes/:id**
  - **Description:** Delete a note by ID.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Success or error message.

- **PUT /notes/archive/:id**
  - **Description:** Archive a note by ID.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Success or error message.

- **PUT /notes/trash/:id**
  - **Description:** Trash a note by ID.
  - **Headers:** `Authorization: Bearer <token>`
  - **Response:** Success or error message.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Commit your changes and push to your forked repository.
4. Open a pull request with a clear description of your changes.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or feedback, please contact [Your Name](mailto:your-email@example.com).
