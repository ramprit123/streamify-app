import SystemLog from '../models/SystemLog.js';

// @desc    Get all system logs with filtering and pagination
// @route   GET /api/logs
// @access  Private/Admin
export const getSystemLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    // Build filter object
    const filter = {};
    if (req.query.action) filter.action = req.query.action;
    if (req.query.entityType) filter.entityType = req.query.entityType;
    if (req.query.user) filter.user = req.query.user;
    if (req.query.startDate && req.query.endDate) {
      filter.createdAt = {
        $gte: new Date(req.query.startDate),
        $lte: new Date(req.query.endDate)
      };
    }

    // Execute query with pagination
    const logs = await SystemLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    // Get total count for pagination
    const total = await SystemLog.countDocuments(filter);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get system log by ID
// @route   GET /api/logs/:id
// @access  Private/Admin
export const getSystemLogById = async (req, res) => {
  try {
    const log = await SystemLog.findById(req.params.id)
      .populate('user', 'name email');

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user activity logs
// @route   GET /api/logs/user/:userId
// @access  Private/Admin
export const getUserActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;

    const logs = await SystemLog.find({ user: req.params.userId })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(startIndex)
      .limit(limit);

    const total = await SystemLog.countDocuments({ user: req.params.userId });

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get activity summary
// @route   GET /api/logs/summary
// @access  Private/Admin
export const getActivitySummary = async (req, res) => {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

    const summary = await SystemLog.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            action: '$action',
            entityType: '$entityType',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          activities: {
            $push: {
              action: '$_id.action',
              entityType: '$_id.entityType',
              count: '$count'
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};