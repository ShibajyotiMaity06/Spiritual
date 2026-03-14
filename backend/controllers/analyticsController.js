



const Analytics = require('../models/Analytics');
const User = require('../models/User');
const Payment = require('../models/Payment');
const DeliveryLog = require('../models/DeliveryLog');




const getOverview = async (req, res, next) => {
  try {
    const [
    totalUsers,
    freeUsers,
    basicUsers,
    premiumUsers,
    activeUsers,
    totalRevenue,
    totalDeliveries] =
    await Promise.all([
    User.countDocuments(),
    User.countDocuments({ subscriptionStatus: 'free' }),
    User.countDocuments({ subscriptionStatus: 'paid_basic' }),
    User.countDocuments({ subscriptionStatus: 'paid_premium' }),
    User.countDocuments({
      lastActivityAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }),
    Payment.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } }]
    ),
    DeliveryLog.countDocuments()]
    );


    const religionBreakdown = await User.aggregate([
    { $group: { _id: '$religion', count: { $sum: 1 } } },
    { $sort: { count: -1 } }]
    );


    const languageBreakdown = await User.aggregate([
    { $group: { _id: '$language', count: { $sum: 1 } } },
    { $sort: { count: -1 } }]
    );

    res.status(200).json({
      success: true,
      data: {
        overview: {
          users: {
            total: totalUsers,
            free: freeUsers,
            basic: basicUsers,
            premium: premiumUsers,
            activeThisWeek: activeUsers,
            paidConversionRate: totalUsers > 0 ?
            `${((basicUsers + premiumUsers) / totalUsers * 100).toFixed(1)}%` :
            '0%'
          },
          revenue: {
            total: totalRevenue[0]?.total || 0,
            currency: 'INR'
          },
          delivery: {
            totalDeliveries
          },
          breakdown: {
            religion: religionBreakdown.map((r) => ({ religion: r._id, count: r.count })),
            language: languageBreakdown.map((l) => ({ language: l._id, count: l.count }))
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
};




const getSignupTrends = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);

    const signups = await User.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }]
    );

    res.status(200).json({
      success: true,
      data: {
        trends: signups.map((s) => ({ date: s._id, signups: s.count }))
      }
    });
  } catch (error) {
    next(error);
  }
};




const getDeliveryStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);


    const byMethod = await DeliveryLog.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$deliveryMethod',
        count: { $sum: 1 },
        totalCost: { $sum: '$cost' }
      }
    }]
    );


    const byStatus = await DeliveryLog.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }]
    );


    const dailyVolume = await DeliveryLog.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
        },
        count: { $sum: 1 },
        cost: { $sum: '$cost' }
      }
    },
    { $sort: { _id: 1 } }]
    );

    res.status(200).json({
      success: true,
      data: {
        byMethod: byMethod.map((m) => ({
          method: m._id,
          count: m.count,
          totalCost: m.totalCost
        })),
        byStatus: byStatus.map((s) => ({
          status: s._id,
          count: s.count
        })),
        dailyVolume: dailyVolume.map((d) => ({
          date: d._id,
          deliveries: d.count,
          cost: d.cost
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};




const getRevenueStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);


    const byPlan = await Payment.aggregate([
    { $match: { status: 'success', createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: '$plan',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$amount' }
      }
    }]
    );


    const dailyRevenue = await Payment.aggregate([
    { $match: { status: 'success', paidAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$paidAt' }
        },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }]
    );

    res.status(200).json({
      success: true,
      data: {
        byPlan: byPlan.map((p) => ({
          plan: p._id,
          subscriptions: p.count,
          revenue: p.totalRevenue
        })),
        dailyRevenue: dailyRevenue.map((d) => ({
          date: d._id,
          revenue: d.revenue,
          transactions: d.count
        }))
      }
    });
  } catch (error) {
    next(error);
  }
};




const getAllUsers = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      religion,
      status,
      language,
      search
    } = req.query;

    const filter = {};
    if (religion) filter.religion = religion;
    if (status) filter.subscriptionStatus = status;
    if (language) filter.language = language;
    if (search) {
      filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { whatsappNumber: { $regex: search, $options: 'i' } }];

    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
    User.find(filter).
    select('-__v').
    sort({ createdAt: -1 }).
    skip(skip).
    limit(Number(limit)).
    lean(),
    User.countDocuments(filter)]
    );

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverview,
  getSignupTrends,
  getDeliveryStats,
  getRevenueStats,
  getAllUsers
};