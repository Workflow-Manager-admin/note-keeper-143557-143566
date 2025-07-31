const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  // PUBLIC_INTERFACE
  /**
   * User registration endpoint
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async register(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          status: 'error',
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({
          status: 'error',
          message: 'User with this email already exists'
        });
      }

      // Create new user
      const user = await User.create({
        email,
        password_hash: password // Will be hashed by the model hook
      });

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to register user'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * User login endpoint
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          status: 'error',
          message: 'Email and password are required'
        });
      }

      // Find user by email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Validate password
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({
          status: 'error',
          message: 'Invalid email or password'
        });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
      const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
      
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        jwtSecret,
        { expiresIn: jwtExpiresIn }
      );

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to login'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get current user profile
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getProfile(req, res) {
    try {
      const user = req.user; // Set by authentication middleware

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            updated_at: user.updated_at
          }
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to get user profile'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * User logout endpoint (client-side token removal)
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async logout(req, res) {
    try {
      // In a stateless JWT system, logout is handled client-side
      // by removing the token from storage
      res.status(200).json({
        status: 'success',
        message: 'Logout successful. Please remove token from client storage.'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to logout'
      });
    }
  }
}

module.exports = new AuthController();
