const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const sequelize = require('../config/database');

// PUBLIC_INTERFACE
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email']
    }
  ]
});

// PUBLIC_INTERFACE
/**
 * Hash password before saving user
 */
User.beforeCreate(async (user) => {
  if (user.password_hash) {
    const saltRounds = 10;
    user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
  }
});

// PUBLIC_INTERFACE
/**
 * Hash password before updating user if password is changed
 */
User.beforeUpdate(async (user) => {
  if (user.changed('password_hash')) {
    const saltRounds = 10;
    user.password_hash = await bcrypt.hash(user.password_hash, saltRounds);
  }
});

// PUBLIC_INTERFACE
/**
 * Instance method to validate password
 * @param {string} password - Plain text password to validate
 * @returns {Promise<boolean>} - True if password matches
 */
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

// PUBLIC_INTERFACE
/**
 * Class method to find user by email
 * @param {string} email - User email
 * @returns {Promise<User|null>} - User instance or null
 */
User.findByEmail = async function(email) {
  return await this.findOne({ where: { email } });
};

module.exports = User;
