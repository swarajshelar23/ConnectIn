const mysql = require('mysql2/promise');
require('dotenv').config();

async function manualSetup() {
  let connection;
  
  try {
    // Connect to specific database directly
    const dbName = process.env.DB_NAME || 'connectin_db';
    
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'Budha@123',
      database: dbName
    });

    console.log(`✅ Connected to database '${dbName}'`);

    // Create tables manually
    console.log('Creating users table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        avatar VARCHAR(255),
        headline VARCHAR(255),
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Creating posts table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        content TEXT NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_posts_user_id (user_id),
        CONSTRAINT fk_posts_user
          FOREIGN KEY (user_id) REFERENCES users(id)
          ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Creating likes table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_like (user_id, post_id),
        INDEX idx_likes_post_id (post_id),
        CONSTRAINT fk_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Creating comments table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        post_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_comments_post_id (post_id),
        CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_comments_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('Creating follows table...');
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS follows (
        id INT AUTO_INCREMENT PRIMARY KEY,
        follower_id INT NOT NULL,
        followee_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY uniq_follow (follower_id, followee_id),
        INDEX idx_follows_follower (follower_id),
        INDEX idx_follows_followee (followee_id),
        CONSTRAINT fk_follows_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_follows_followee FOREIGN KEY (followee_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    console.log('✅ All tables created successfully');

    // Insert sample users
    console.log('Inserting sample users...');
    const users = [
      ['John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Senior Software Engineer at TechCorp', 'Passionate about building scalable web applications and mentoring junior developers.'],
      ['Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Product Manager | Startup Enthusiast', 'Love turning ideas into products that users love. Always learning, always building.'],
      ['Mike Johnson', 'mike@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'UX Designer & Creative Director', 'Designing beautiful and intuitive user experiences. Coffee addict and design thinking advocate.']
    ];

    for (const user of users) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO users (name, email, password, headline, bio) VALUES (?, ?, ?, ?, ?)',
          user
        );
      } catch (err) {
        // Ignore duplicate entries
        if (!err.message.includes('Duplicate entry')) {
          console.log(`⚠️  User insert failed: ${err.message}`);
        }
      }
    }

    // Insert sample posts
    console.log('Inserting sample posts...');
    const posts = [
      [1, 'Just shipped a new feature that reduces page load time by 40%! Performance optimization is so satisfying. 🚀'],
      [2, 'Excited to announce that our startup just closed Series A funding! Big thanks to our amazing team and investors. 💪'],
      [1, 'Working on a new open-source project. Stay tuned for the announcement next week!'],
      [3, 'The importance of user research cannot be overstated. Spent the day interviewing users and got so many valuable insights. #UXDesign'],
      [2, 'Pro tip: Always validate your assumptions with real user data before building features. Saves time and resources in the long run.']
    ];

    for (const post of posts) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO posts (user_id, content) VALUES (?, ?)',
          post
        );
      } catch (err) {
        console.log(`⚠️  Post insert failed: ${err.message}`);
      }
    }

    // Insert sample follows
    console.log('Inserting sample follows...');
    const follows = [[1, 2], [1, 3], [2, 1], [2, 3], [3, 1]];
    for (const follow of follows) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO follows (follower_id, followee_id) VALUES (?, ?)',
          follow
        );
      } catch (err) {
        if (!err.message.includes('Duplicate entry')) {
          console.log(`⚠️  Follow insert failed: ${err.message}`);
        }
      }
    }

    // Insert sample likes
    console.log('Inserting sample likes...');
    const likes = [[2, 1], [3, 1], [1, 2], [3, 2], [1, 4], [2, 4]];
    for (const like of likes) {
      try {
        await connection.execute(
          'INSERT IGNORE INTO likes (user_id, post_id) VALUES (?, ?)',
          like
        );
      } catch (err) {
        if (!err.message.includes('Duplicate entry')) {
          console.log(`⚠️  Like insert failed: ${err.message}`);
        }
      }
    }

    console.log('\n🎉 Database setup complete!');
    console.log('Test accounts (password: "password"):');
    console.log('- john@example.com');
    console.log('- jane@example.com');
    console.log('- mike@example.com');
    console.log('\nYou can now start the application with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    
    if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('\n🔧 The database doesn\'t exist. Creating it...');
      try {
        // Try to create database first
        const tempConnection = await mysql.createConnection({
          host: process.env.DB_HOST || 'localhost',
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || 'Budha@123'
        });
        
        const dbName = process.env.DB_NAME || 'connectin_db';
        await tempConnection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Database '${dbName}' created`);
        await tempConnection.end();
        
        console.log('Please run this script again: node manual-setup.js');
      } catch (createErr) {
        console.error('Failed to create database:', createErr.message);
      }
    } else {
      console.log('\nTroubleshooting:');
      console.log('1. Make sure MySQL is running');
      console.log('2. Check your .env file credentials');
      console.log('3. Ensure the database exists');
    }
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

manualSetup();
