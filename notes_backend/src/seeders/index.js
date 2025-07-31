const { User, Note, initializeDatabase } = require('../models');

// PUBLIC_INTERFACE
/**
 * Seed database with sample data for development
 * @returns {Promise<void>}
 */
const seedDatabase = async () => {
  try {
    // Initialize database first
    await initializeDatabase(true); // Force sync to reset tables
    
    console.log('Starting database seeding...');
    
    // Create sample users
    const user1 = await User.create({
      email: 'john@example.com',
      password_hash: 'password123'
    });
    
    const user2 = await User.create({
      email: 'jane@example.com', 
      password_hash: 'password456'
    });
    
    console.log('Sample users created');
    
    // Create sample notes for user1
    await Note.create({
      user_id: user1.id,
      title: 'Welcome to Notes App',
      content: 'This is your first note! You can create, edit, and delete notes here.'
    });
    
    await Note.create({
      user_id: user1.id,
      title: 'Shopping List',
      content: '- Milk\n- Bread\n- Eggs\n- Apples\n- Cheese'
    });
    
    await Note.create({
      user_id: user1.id,
      title: 'Meeting Notes',
      content: 'Project discussion:\n- Review timeline\n- Assign tasks\n- Set next meeting date'
    });
    
    // Create sample notes for user2
    await Note.create({
      user_id: user2.id,
      title: 'Travel Plans',
      content: 'Summer vacation ideas:\n- Beach resort\n- Mountain hiking\n- City tour'
    });
    
    await Note.create({
      user_id: user2.id,
      title: 'Book Recommendations',
      content: 'Books to read:\n- The Great Gatsby\n- To Kill a Mockingbird\n- 1984'
    });
    
    console.log('Sample notes created');
    console.log('Database seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Seeding finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
