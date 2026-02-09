const express = require('express');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcrypt');
const multer = require('multer');
const fs = require('fs');
const pool = require('./db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'));
}


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  }
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Make session data and flash messages available in views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.flash = req.session.flash || {};
  delete req.session.flash;
  next();
});

// Simple auth guard middleware
function authRequired(req, res, next) {
  if (!req.session.user) {
    req.session.flash = { error: ['Please login to continue'] };
    return res.redirect('/login');
  }
  next();
}




app.get('/', (req, res) => res.render('index', { title: 'Welcome to ConnectIn' }));


app.get('/db-status', async (req, res) => {
  try {

    await pool.execute('SELECT 1');
    
 
    const [tables] = await pool.execute('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);
    
    // Check user count
    let userCount = 0;
    let postCount = 0;
    
    if (tableNames.includes('users')) {
      const [users] = await pool.execute('SELECT COUNT(*) as count FROM users');
      userCount = users[0].count;
    }
    
    if (tableNames.includes('posts')) {
      const [posts] = await pool.execute('SELECT COUNT(*) as count FROM posts');
      postCount = posts[0].count;
    }
    
    res.json({
      status: 'success',
      connection: 'OK',
      database: process.env.DB_NAME || 'connectin_db',
      tables: tableNames,
      userCount,
      postCount
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      error: err.message,
      code: err.code
    });
  }
});

// REGISTER
app.get('/register', (req, res) => res.render('register.ejs', { title: 'Register - ConnectIn' }));
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    const errors = [];
    if (!name || !name.trim()) errors.push('Name is required');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Valid email is required');
    if (!password || password.length < 6) errors.push('Password must be at least 6 characters');

    if (errors.length) {
      req.session.flash = { error: errors };
      return res.redirect('/register');
    }

    // Duplicate email check
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      req.session.flash = { error: ['Email is already registered'] };
      return res.redirect('/register');
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name.trim(), email.toLowerCase(), hashed]);
    req.session.flash = { success: ['Registration successful. Please login.'] };
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Registration failed'] };
    res.redirect('/register');
  }
});

// LOGIN
app.get('/login', (req, res) => res.render('login.ejs', { title: 'Login - ConnectIn' }));
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      req.session.flash = { error: ['Email and password are required'] };
      return res.redirect('/login');
    }
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (rows.length && await bcrypt.compare(password, rows[0].password)) {
      req.session.user = rows[0];
      res.redirect('/feed');
    } else {
      req.session.flash = { error: ['Invalid email or password'] };
      res.redirect('/login');
    }
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Login failed'] };
    res.redirect('/login');
  }
});

// LOGOUT
app.get('/logout', (req, res) => req.session.destroy(() => res.redirect('/')));

// FEED (protected)
app.get('/feed', authRequired, async (req, res) => {
  try {
    // First check if tables exist
    const [tables] = await pool.execute("SHOW TABLES LIKE 'posts'");
    if (tables.length === 0) {
      req.session.flash = { error: ['Database not set up. Please run: npm run setup-db'] };
      return res.render('feed', { posts: [], title: 'Feed - ConnectIn' });
    }

    const [posts] = await pool.execute(`
      SELECT p.id, p.content, p.image, p.created_at, 
             u.id AS user_id, u.name, u.avatar, u.headline,
             COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id), 0) AS like_count,
             COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?), 0) AS user_liked,
             COALESCE((SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id), 0) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      ORDER BY p.created_at DESC
      LIMIT 50
    `, [req.session.user.id]);
    
    res.render('feed', { posts, title: 'Feed - ConnectIn' });
  } catch (err) {
    console.error('Feed error:', err.message);
    console.error('Stack:', err.stack);
    
    // Check if it's a connection error
    if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
      req.session.flash = { error: ['Database connection failed. Check your .env file and ensure MySQL is running.'] };
    } else if (err.code === 'ER_NO_SUCH_TABLE') {
      req.session.flash = { error: ['Database tables not found. Please run: npm run setup-db'] };
    } else {
      req.session.flash = { error: ['Unable to load feed. Error: ' + err.message] };
    }
    
    res.render('feed', { posts: [], title: 'Feed - ConnectIn' });
  }
});

// CREATE POST (protected)
app.post('/posts', authRequired, upload.single('image'), async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    req.session.flash = { error: ['Post content cannot be empty'] };
    return res.redirect('/feed');
  }
  const image = req.file ? '/uploads/' + req.file.filename : null;
  try {
    await pool.execute(
      'INSERT INTO posts (user_id, content, image) VALUES (?, ?, ?)',
      [req.session.user.id, content.trim(), image]
    );
    res.redirect('/feed');
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Failed to create post'] };
    res.redirect('/feed');
  }
});

// PROFILE VIEW
app.get('/u/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    const [users] = await pool.execute(
      'SELECT id, name, headline, bio, avatar FROM users WHERE id = ?',
      [userId]
    );
    if (!users.length) {
      return res.status(404).render('404', { title: 'User Not Found' });
    }
    const user = users[0];
    
    const [posts] = await pool.execute(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
             COALESCE((SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.user_id = ?), 0) AS user_liked
      FROM posts p 
      WHERE p.user_id = ? 
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [req.session.user ? req.session.user.id : 0, userId]);

    // Get follow counts and status
    const [followStats] = await pool.execute(`
      SELECT 
        (SELECT COUNT(*) FROM follows WHERE followee_id = ?) AS follower_count,
        (SELECT COUNT(*) FROM follows WHERE follower_id = ?) AS following_count
    `, [userId, userId]);

    let isFollowing = false;
    if (req.session.user && req.session.user.id != userId) {
      const [followCheck] = await pool.execute(
        'SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?',
        [req.session.user.id, userId]
      );
      isFollowing = followCheck.length > 0;
    }

    res.render('profile', { 
      profile: user, 
      posts, 
      followerCount: followStats[0].follower_count,
      followingCount: followStats[0].following_count,
      isFollowing,
      title: `${user.name} - Profile`
    });
  } catch (err) {
    console.error('Profile error:', err);
    req.session.flash = { error: ['Unable to load profile. Please try again.'] };
    res.redirect('/feed');
  }
});

// EDIT PROFILE (protected)
app.post('/u/:id/edit', authRequired, upload.single('avatar'), async (req, res) => {
  const targetId = Number(req.params.id);
  if (!req.session.user || Number(req.session.user.id) !== targetId) {
    req.session.flash = { error: ['You cannot edit another user\'s profile'] };
    return res.redirect('/u/' + req.params.id);
  }
  const { headline, bio } = req.body;
  try {
    let updateQuery = 'UPDATE users SET headline = ?, bio = ?';
    let updateParams = [headline || null, bio || null];
    
    // Handle avatar upload
    if (req.file) {
      updateQuery += ', avatar = ?';
      updateParams.push('/uploads/' + req.file.filename);
    }
    
    updateQuery += ' WHERE id = ?';
    updateParams.push(targetId);
    
    await pool.execute(updateQuery, updateParams);
    req.session.user.headline = headline;
    if (req.file) {
      req.session.user.avatar = '/uploads/' + req.file.filename;
    }
    req.session.flash = { success: ['Profile updated successfully!'] };
    res.redirect('/u/' + req.params.id);
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Failed to update profile'] };
    res.redirect('/u/' + req.params.id);
  }
});

// LIKE/UNLIKE POST
app.post('/posts/:id/like', authRequired, async (req, res) => {
  const postId = Number(req.params.id);
  const userId = req.session.user.id;
  try {
    const [existing] = await pool.execute('SELECT id FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
    if (existing.length) {
      await pool.execute('DELETE FROM likes WHERE user_id = ? AND post_id = ?', [userId, postId]);
    } else {
      await pool.execute('INSERT INTO likes (user_id, post_id) VALUES (?, ?)', [userId, postId]);
    }
    
    // Redirect back to the referring page or feed as fallback
    const referer = req.get('Referer');
    if (referer && referer.includes('/u/')) {
      res.redirect(referer);
    } else {
      res.redirect('/feed');
    }
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Failed to update like'] };
    const referer = req.get('Referer');
    if (referer && referer.includes('/u/')) {
      res.redirect(referer);
    } else {
      res.redirect('/feed');
    }
  }
});

// ADD COMMENT
app.post('/posts/:id/comment', authRequired, async (req, res) => {
  const postId = Number(req.params.id);
  const { content } = req.body;
  if (!content || !content.trim()) {
    req.session.flash = { error: ['Comment cannot be empty'] };
    const referer = req.get('Referer');
    if (referer && referer.includes('/u/')) {
      return res.redirect(referer);
    } else {
      return res.redirect('/feed');
    }
  }
  try {
    await pool.execute('INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)', [req.session.user.id, postId, content.trim()]);
    
    // Redirect back to the referring page or feed as fallback
    const referer = req.get('Referer');
    if (referer && referer.includes('/u/')) {
      res.redirect(referer);
    } else {
      res.redirect('/feed');
    }
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Failed to add comment'] };
    const referer = req.get('Referer');
    if (referer && referer.includes('/u/')) {
      res.redirect(referer);
    } else {
      res.redirect('/feed');
    }
  }
});

// FOLLOW/UNFOLLOW USER
app.post('/u/:id/follow', authRequired, async (req, res) => {
  const targetId = Number(req.params.id);
  const userId = req.session.user.id;
  if (userId === targetId) {
    req.session.flash = { error: ['You cannot follow yourself'] };
    return res.redirect('/u/' + targetId);
  }
  try {
    const [existing] = await pool.execute('SELECT id FROM follows WHERE follower_id = ? AND followee_id = ?', [userId, targetId]);
    if (existing.length) {
      await pool.execute('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?', [userId, targetId]);
    } else {
      await pool.execute('INSERT INTO follows (follower_id, followee_id) VALUES (?, ?)', [userId, targetId]);
    }
    res.redirect('/u/' + targetId);
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Failed to update follow status'] };
    res.redirect('/u/' + targetId);
  }
});

// SEARCH
app.get('/search', authRequired, async (req, res) => {
  const { q } = req.query;
  if (!q || !q.trim()) {
    return res.render('search', { query: '', users: [], posts: [], title: 'Search - ConnectIn' });
  }
  
  try {
    const searchTerm = `%${q.trim()}%`;
    
    // Search users
    const [users] = await pool.execute(`
      SELECT id, name, headline, avatar,
             (SELECT COUNT(*) FROM follows WHERE followee_id = users.id) AS follower_count
      FROM users 
      WHERE name LIKE ? OR headline LIKE ? OR bio LIKE ?
      LIMIT 10
    `, [searchTerm, searchTerm, searchTerm]);

    // Search posts
    const [posts] = await pool.execute(`
      SELECT p.id, p.content, p.image, p.created_at,
             u.id AS user_id, u.name, u.avatar, u.headline,
             (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
             (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count
      FROM posts p
      JOIN users u ON p.user_id = u.id
      WHERE p.content LIKE ?
      ORDER BY p.created_at DESC
      LIMIT 20
    `, [searchTerm]);

    res.render('search', { query: q, users, posts, title: 'Search - ConnectIn' });
  } catch (err) {
    console.error(err);
    req.session.flash = { error: ['Search failed'] };
    res.render('search', { query: q || '', users: [], posts: [], title: 'Search - ConnectIn' });
  }
});

// 404
app.use((req, res) => res.status(404).render('404', { title: 'Not Found' }));

// START SERVER
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
