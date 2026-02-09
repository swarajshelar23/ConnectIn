-- Seed data for connectin-prototype
-- Run this after schema.sql to populate sample data
-- Note: All passwords are 'password' (hashed with bcrypt)

INSERT INTO users (name, email, password, headline, bio) VALUES
('John Doe', 'john@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Senior Software Engineer at TechCorp', 'Passionate about building scalable web applications and mentoring junior developers. 5+ years experience in Node.js, React, and cloud architecture.'),
('Jane Smith', 'jane@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Product Manager | Startup Enthusiast', 'Love turning ideas into products that users love. Always learning, always building. Currently leading product at a fast-growing fintech startup.'),
('Mike Johnson', 'mike@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'UX Designer & Creative Director', 'Designing beautiful and intuitive user experiences. Coffee addict and design thinking advocate. 8+ years creating user-centered designs.'),
('Sarah Wilson', 'sarah@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Data Scientist | AI Enthusiast', 'Turning data into insights and insights into action. Specialized in machine learning and predictive analytics. PhD in Computer Science.'),
('Alex Chen', 'alex@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'DevOps Engineer | Cloud Architect', 'Building robust infrastructure and automating everything. AWS certified solutions architect with a passion for container orchestration.'),
('Emily Davis', 'emily@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Marketing Director | Growth Hacker', 'Driving user acquisition and retention through data-driven marketing strategies. Love experimenting with new growth channels.'),
('David Brown', 'david@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Frontend Developer | React Specialist', 'Creating amazing user interfaces with modern web technologies. Open source contributor and tech blogger.'),
('Lisa Garcia', 'lisa@example.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cybersecurity Analyst | Ethical Hacker', 'Protecting organizations from cyber threats. CISSP certified with expertise in penetration testing and security audits.');

INSERT INTO posts (user_id, content) VALUES
(1, 'Just shipped a new feature that reduces page load time by 40%! Performance optimization is so satisfying. Used lazy loading, code splitting, and optimized our database queries. 🚀 #WebPerformance #TechWins'),
(2, 'Excited to announce that our startup just closed Series A funding! Big thanks to our amazing team and investors. The journey continues! 💪 #StartupLife #Funding'),
(1, 'Working on a new open-source project that simplifies microservices deployment. Stay tuned for the announcement next week! Always excited to give back to the community. #OpenSource'),
(3, 'The importance of user research cannot be overstated. Spent the day interviewing users and got so many valuable insights. Remember: you are not your user! #UXDesign #UserResearch'),
(2, 'Pro tip: Always validate your assumptions with real user data before building features. Saves time and resources in the long run. Data-driven decisions > gut feelings. #ProductManagement'),
(4, 'Just finished training a new machine learning model that predicts customer churn with 94% accuracy! The power of feature engineering and ensemble methods never ceases to amaze me. 🤖 #MachineLearning #DataScience'),
(5, 'Migrated our entire infrastructure to Kubernetes this week. Zero downtime deployment achieved! The orchestration capabilities are incredible. #DevOps #Kubernetes #CloudNative'),
(6, 'Our latest A/B test showed a 25% increase in conversion rates just by changing the CTA button color and copy. Small changes, big impact! #GrowthHacking #ConversionOptimization'),
(7, 'Built a beautiful dashboard using React and D3.js today. Data visualization is an art form that combines technical skills with design thinking. #React #DataViz #Frontend'),
(8, 'Completed a security audit and found 15 vulnerabilities. Remember: security is not a feature, it\'s a requirement. Always think like an attacker! #Cybersecurity #InfoSec'),
(1, 'Mentoring junior developers is one of the most rewarding parts of my job. Seeing them grow and succeed makes all the effort worthwhile. #Mentorship #TechCommunity'),
(3, 'Attended an amazing design conference today. Key takeaway: empathy is the most important skill for any designer. Understanding your users deeply is everything. #DesignThinking'),
(4, 'Working with unstructured data is challenging but fascinating. Today I processed 10TB of social media data to extract sentiment patterns. Big data, bigger insights! #BigData'),
(5, 'Infrastructure as Code has revolutionized how we manage deployments. Everything is version controlled, reproducible, and scalable. #IaC #Terraform #Automation'),
(2, 'Customer feedback session today revealed some surprising insights about our product. Sometimes what users say they want is different from what they actually need. #ProductStrategy');

INSERT INTO follows (follower_id, followee_id) VALUES
(1, 2), (1, 3), (1, 4), (1, 7),
(2, 1), (2, 3), (2, 6), (2, 8),
(3, 1), (3, 2), (3, 4), (3, 6),
(4, 1), (4, 2), (4, 5), (4, 8),
(5, 1), (5, 4), (5, 7), (5, 8),
(6, 2), (6, 3), (6, 7), (6, 8),
(7, 1), (7, 3), (7, 4), (7, 5),
(8, 2), (8, 4), (8, 5), (8, 6);

INSERT INTO likes (user_id, post_id) VALUES
(2, 1), (3, 1), (4, 1), (7, 1),
(1, 2), (3, 2), (6, 2), (8, 2),
(2, 3), (4, 3), (5, 3), (7, 3),
(1, 4), (2, 4), (6, 4), (8, 4),
(1, 5), (3, 5), (4, 5), (6, 5),
(1, 6), (2, 6), (5, 6), (8, 6),
(2, 7), (3, 7), (4, 7), (6, 7),
(1, 8), (3, 8), (5, 8), (7, 8),
(2, 9), (4, 9), (6, 9), (8, 9),
(1, 10), (3, 10), (5, 10), (7, 10),
(2, 11), (4, 11), (6, 11), (8, 11),
(1, 12), (5, 12), (7, 12), (8, 12),
(2, 13), (3, 13), (6, 13), (7, 13),
(1, 14), (4, 14), (5, 14), (8, 14),
(3, 15), (4, 15), (6, 15), (7, 15);

INSERT INTO comments (user_id, post_id, content) VALUES
(2, 1, 'Amazing work! What techniques did you use for optimization? Would love to implement similar improvements.'),
(3, 1, 'Would love to hear more about your approach! Performance is crucial for user experience.'),
(4, 1, 'Great results! Have you considered implementing service workers for caching?'),
(1, 2, 'Congratulations! Well deserved success 🎉 Your product vision is inspiring.'),
(6, 2, 'This is huge! Excited to see how you scale the marketing efforts with this funding.'),
(2, 4, 'Totally agree! User research is the foundation of good design. Data beats opinions every time.'),
(1, 4, 'So true! I always tell my team: assumptions are the enemy of good products.'),
(5, 6, 'Impressive accuracy! What algorithms did you use? Random Forest or XGBoost?'),
(8, 6, 'Machine learning in production is fascinating. How do you handle model drift?'),
(1, 7, 'Kubernetes is a game changer! The learning curve is steep but so worth it.'),
(4, 7, 'Zero downtime deployments are the holy grail. Great achievement!'),
(2, 8, 'A/B testing is so powerful when done right. What was your sample size?'),
(3, 8, 'Color psychology in UX is underrated. Great example of data-driven design!'),
(3, 9, 'D3.js creates such beautiful visualizations! The learning curve is worth it.'),
(4, 9, 'Data storytelling is an art. Your dashboards always tell compelling stories.'),
(5, 10, 'Security audits are crucial! Thanks for keeping us all safer online.'),
(1, 10, 'Prevention is better than cure, especially in cybersecurity.'),
(3, 11, 'Mentorship is so important in tech. Thank you for giving back to the community!'),
(7, 11, 'Great mentors shape the future of our industry. Keep up the amazing work!'),
(1, 12, 'Empathy-driven design creates the best user experiences. Couldn\'t agree more!'),
(4, 12, 'Design thinking workshops should be mandatory for all product teams.'),
(1, 13, 'Big data processing at scale is incredibly complex. Impressive work!'),
(5, 13, 'Sentiment analysis on social media data is so valuable for businesses.'),
(7, 14, 'IaC has transformed our deployment process too. Everything is so much more reliable now.'),
(1, 14, 'Version controlled infrastructure is a beautiful thing. No more snowflake servers!'),
(1, 15, 'Customer development is an ongoing process. Great insights from your research!'),
(3, 15, 'The gap between what users say and do is always fascinating to explore.');
