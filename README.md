# Task Manager Backend - MERN Stack

A modern RESTful API backend built with Node.js, Express, and MongoDB for a full-featured task management application.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Development**: nodemon for hot reload

## ✨ Features

### Authentication
- User registration and login
- JWT-based authentication (access & refresh tokens)
- Password hashing with bcrypt
- Protected routes with middleware

### Projects Management
- Create, read, update, delete projects
- Archive/unarchive functionality
- Owner-based access control
- Task count tracking

### Tasks Management
- Full CRUD operations
- Status tracking (todo, in_progress, in_review, done)
- Priority levels (low, medium, high, urgent)
- Tags support (array of strings)
- Time tracking (estimated & actual)
- Due dates with overdue detection
- Notes and descriptions
- Subtasks (parent-child relationships)
- Recurring tasks support
- Pomodoro timer integration
- Order index for drag & drop

### Users
- List active users
- User profiles
- Active/inactive status management

## 📋 Prerequisites

- Node.js 18 or higher
- npm or yarn
- MongoDB (optional - uses in-memory fallback)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/Deepak-Porwal-code/task_manager_backend_MERN.git
cd task_manager_backend_MERN
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:3000
```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Seed Database
```bash
npm run seed
```

Or use the API endpoint:
```bash
curl -X POST http://localhost:5000/api/seed
```

The server will run on `http://localhost:5000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user (protected)

### Projects
- `GET /api/projects` - List all projects (protected)
- `POST /api/projects` - Create project (protected)
- `GET /api/projects/:id` - Get project with tasks (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Tasks
- `GET /api/tasks` - List tasks with filters (protected)
- `POST /api/tasks` - Create task (protected)
- `GET /api/tasks/:id` - Get task details (protected)
- `PUT /api/tasks/:id` - Update task (protected)
- `DELETE /api/tasks/:id` - Delete task (protected)
- `POST /api/tasks/:id/time` - Add time to task (protected)
- `GET /api/tasks/:id/subtasks` - Get subtasks (protected)

### Users
- `GET /api/users` - List active users (protected)

### Utility
- `GET /api/health` - Health check
- `POST /api/seed` - Seed database with test data

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

### Example Login Request
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"john","password":"password123"}'
```

### Example Protected Request
```bash
curl -X GET http://localhost:5000/api/projects \
  -H "Authorization: Bearer <your-token>"
```

## 📊 Database Models

### User
- email (unique, required)
- username (unique, required)
- password (hashed, required)
- fullName
- isActive (default: true)
- timestamps

### Project
- name (required)
- description
- owner (ref: User)
- isArchived (default: false)
- timestamps

### Task
- title (required)
- description
- status (enum: todo, in_progress, in_review, done)
- priority (enum: low, medium, high, urgent)
- project (ref: Project)
- assignee (ref: User)
- dueDate
- completedAt
- estimatedTime (minutes)
- actualTime (minutes)
- tags (array)
- notes
- orderIndex
- parentTask (ref: Task)
- isRecurring
- recurrencePattern
- timestamps

## 🧪 Testing

Test credentials after seeding:
- Username: `john` | Password: `password123`
- Username: `jane` | Password: `password123`

## 🐳 Docker Support

```bash
docker-compose up -d
```

This starts:
- MongoDB on port 27017
- Backend API on port 5000

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 5000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/taskmanager |
| JWT_SECRET | JWT secret key | (required) |
| JWT_EXPIRES_IN | Access token expiry | 1h |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 30d |
| CORS_ORIGIN | Allowed CORS origin | http://localhost:3000 |

## 🔒 Security Features

- Password hashing with bcrypt (10 rounds)
- JWT token authentication
- Protected routes middleware
- Input validation on all endpoints
- CORS configuration
- MongoDB injection prevention
- Error handling middleware

## 📦 Project Structure

```
backend-node/
├── config/           # Configuration files
│   ├── config.js    # App configuration
│   ├── db.js        # Database connection
│   └── db-dev.js    # Development DB with fallback
├── models/          # Mongoose models
│   ├── User.js
│   ├── Project.js
│   └── Task.js
├── routes/          # API routes
│   ├── auth.js
│   ├── projects.js
│   ├── tasks.js
│   ├── users.js
│   ├── health.js
│   └── seed.js
├── middleware/      # Custom middleware
│   ├── auth.js      # JWT authentication
│   └── errorHandler.js
├── utils/           # Utility functions
│   └── generateToken.js
├── scripts/         # Utility scripts
│   └── seed.js
├── server.js        # Application entry point
├── package.json
└── .env.example
```

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-secret
git push heroku main
```

### Railway
```bash
railway init
railway add
railway up
```

### Environment Setup for Production
1. Set strong JWT_SECRET
2. Use MongoDB Atlas or managed MongoDB
3. Set NODE_ENV=production
4. Configure CORS_ORIGIN to your frontend URL
5. Enable HTTPS

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - feel free to use this project for learning or production!

## 👤 Author

Deepak Porwal

## 🙏 Acknowledgments

- Built with modern MERN stack best practices
- Inspired by industry-standard API design
- Follows RESTful principles

## 📞 Support

For issues and questions:
- Open an issue on GitHub
- Check the documentation files in the repository

---

**Happy Coding!** 🚀
