const sequelize = require('../config/database');
const User = require('./User');
const Note = require('./Note');

// Define associations
// PUBLIC_INTERFACE
/**
 * Set up model associations
 */
const setupAssociations = () => {
  // User has many Notes
  User.hasMany(Note, {
    foreignKey: 'user_id',
    as: 'notes',
    onDelete: 'CASCADE'
  });

  // Note belongs to User
  Note.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
  });
};

setupAssociations();

// PUBLIC_INTERFACE
/**
 * Initialize database and sync models
 * @param {boolean} force - Whether to force sync (drop tables)
 * @returns {Promise<void>}
 */
const initializeDatabase = async (force = false) => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    await sequelize.sync({ force });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  User,
  Note,
  initializeDatabase
};
