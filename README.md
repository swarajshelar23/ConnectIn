# ConnectIn

A full-featured social networking platform built with Node.js, Express, and MySQL. Features include user authentication, posts with images, likes, comments, follow system, and search functionality.

## Features

- **User Authentication**: Secure registration and login with bcrypt password hashing
- **User Profiles**: Customizable profiles with avatar, headline, and bio
- **Posts**: Create text and image posts with file upload support
- **Social Interactions**: Like and comment on posts
- **Follow System**: Follow/unfollow users and see follower/following counts
- **Search**: Search for users and posts
- **Responsive Design**: Modern, mobile-friendly interface
- **Flash Messages**: User feedback for actions and errors
- **File Upload**: Image upload with file type and size validation

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MySQL with mysql2
- **Authentication**: bcrypt, express-session
- **File Upload**: Multer
- **Templating**: EJS
- **Styling**: Custom CSS with modern design

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd connectin-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update the values:
     ```env
     PORT=3000
     DB_HOST=localhost
     DB_USER=your_mysql_username
     DB_PASSWORD=your_mysql_password
     DB_NAME=connectin_db
     SESSION_SECRET=your_secure_random_string
     ```

4. **Set up the database**
   ```bash
   # Automated setup (recommended)
   npm run setup-db
   
   # OR manual setup
   mysql -u your_username -p -e "CREATE DATABASE connectin_db;"
   mysql -u your_username -p connectin_db < schema.sql
   mysql -u your_username -p connectin_db < seed.sql
   ```

5. **Start the application**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

6. **Access the application**
   - Open your browser and go to `http://localhost:3000`

## Database Schema

The application uses the following main tables:

- **users**: User accounts with profile information
- **posts**: User posts with content and optional images
- **likes**: Post likes (many-to-many relationship)
- **comments**: Post comments
- **follows**: User follow relationships

## API Endpoints

### Authentication
- `GET /` - Home page
- `GET /register` - Registration form
- `POST /register` - Create new user account
- `GET /login` - Login form
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Posts
- `GET /feed` - View all posts (protected)
- `POST /posts` - Create new post (protected)
- `POST /posts/:id/like` - Like/unlike post (protected)
- `POST /posts/:id/comment` - Add comment to post (protected)

### Users
- `GET /u/:id` - View user profile
- `POST /u/:id/edit` - Edit user profile (protected, owner only)
- `POST /u/:id/follow` - Follow/unfollow user (protected)

### Search
- `GET /search` - Search users and posts (protected)

## File Structure

```
connectin-prototype/
├── app.js              # Main application file
├── db.js               # Database connection
├── package.json        # Dependencies and scripts
├── schema.sql          # Database schema
├── seed.sql            # Sample data
├── .env.example        # Environment variables template
├── public/
│   └── css/
│       └── main.css    # Styles
├── uploads/            # User uploaded files
└── views/              # EJS templates
    ├── partials/
    │   ├── header.ejs
    │   └── footer.ejs
    ├── index.ejs
    ├── login.ejs
    ├── register.ejs
    ├── feed.ejs
    ├── profile.ejs
    ├── search.ejs
    └── 404.ejs
```

## Security Features

- Password hashing with bcrypt
- Session-based authentication
- CSRF protection through session validation
- File upload restrictions (type and size)
- Input validation and sanitization
- SQL injection prevention with parameterized queries

## Development

### Adding New Features

1. Add new routes in `app.js`
2. Create corresponding EJS templates in `views/`
3. Update CSS in `public/css/main.css`
4. Add database migrations if needed

### Testing

The application includes seed data for testing:
- Test users with email/password: `john@example.com/password`, `jane@example.com/password`, `mike@example.com/password`
- Sample posts, likes, comments, and follows

## Deployment

For production deployment:

1. Set up a production MySQL database
2. Configure environment variables for production
3. Use a process manager like PM2
4. Set up a reverse proxy with Nginx
5. Enable HTTPS with SSL certificates

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
