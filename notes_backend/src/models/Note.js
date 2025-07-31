const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// PUBLIC_INTERFACE
const Note = sequelize.define('Note', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'notes',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

// PUBLIC_INTERFACE
/**
 * Class method to find notes by user ID
 * @param {number} userId - User ID
 * @returns {Promise<Note[]>} - Array of user's notes
 */
Note.findByUserId = async function(userId) {
  return await this.findAll({ 
    where: { user_id: userId },
    order: [['updated_at', 'DESC']]
  });
};

// PUBLIC_INTERFACE
/**
 * Class method to find note by ID and user ID
 * @param {number} noteId - Note ID
 * @param {number} userId - User ID
 * @returns {Promise<Note|null>} - Note instance or null
 */
Note.findByIdAndUserId = async function(noteId, userId) {
  return await this.findOne({ 
    where: { 
      id: noteId,
      user_id: userId 
    }
  });
};

module.exports = Note;
