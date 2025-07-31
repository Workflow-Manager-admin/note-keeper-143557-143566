const { Note } = require('../models');
const { Op } = require('sequelize');

class NotesController {
  // PUBLIC_INTERFACE
  /**
   * Get all notes for the authenticated user
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getAllNotes(req, res) {
    try {
      const userId = req.user.id;
      const { search, page = 1, limit = 50 } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const whereClause = { user_id: userId };

      // Add search functionality
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: notes } = await Note.findAndCountAll({
        where: whereClause,
        order: [['updated_at', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.status(200).json({
        status: 'success',
        data: {
          notes,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            pages: Math.ceil(count / parseInt(limit))
          }
        }
      });
    } catch (error) {
      console.error('Get notes error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve notes'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Get a specific note by ID
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const note = await Note.findByIdAndUserId(parseInt(id), userId);
      
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      res.status(200).json({
        status: 'success',
        data: { note }
      });
    } catch (error) {
      console.error('Get note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to retrieve note'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Create a new note
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async createNote(req, res) {
    try {
      const { title, content } = req.body;
      const userId = req.user.id;

      // Validate input
      if (!title || title.trim().length === 0) {
        return res.status(400).json({
          status: 'error',
          message: 'Title is required'
        });
      }

      if (title.length > 255) {
        return res.status(400).json({
          status: 'error',
          message: 'Title must be 255 characters or less'
        });
      }

      const note = await Note.create({
        user_id: userId,
        title: title.trim(),
        content: content || ''
      });

      res.status(201).json({
        status: 'success',
        message: 'Note created successfully',
        data: { note }
      });
    } catch (error) {
      console.error('Create note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to create note'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Update an existing note
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const { title, content } = req.body;
      const userId = req.user.id;

      // Find the note
      const note = await Note.findByIdAndUserId(parseInt(id), userId);
      
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      // Validate input
      if (title !== undefined) {
        if (!title || title.trim().length === 0) {
          return res.status(400).json({
            status: 'error',
            message: 'Title cannot be empty'
          });
        }

        if (title.length > 255) {
          return res.status(400).json({
            status: 'error',
            message: 'Title must be 255 characters or less'
          });
        }
      }

      // Update note
      const updateData = {};
      if (title !== undefined) updateData.title = title.trim();
      if (content !== undefined) updateData.content = content;

      await note.update(updateData);

      res.status(200).json({
        status: 'success',
        message: 'Note updated successfully',
        data: { note }
      });
    } catch (error) {
      console.error('Update note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to update note'
      });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Delete a note
   * @param {object} req - Express request object
   * @param {object} res - Express response object
   */
  async deleteNote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const note = await Note.findByIdAndUserId(parseInt(id), userId);
      
      if (!note) {
        return res.status(404).json({
          status: 'error',
          message: 'Note not found'
        });
      }

      await note.destroy();

      res.status(200).json({
        status: 'success',
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Delete note error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete note'
      });
    }
  }
}

module.exports = new NotesController();
