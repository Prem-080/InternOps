const auth = require('../../middleware/auth');
const direct = require('../../middleware/directManager');
const ownership = require('../../middleware/ownership');
const repo = require('./repository');
const { createAuditLog } = require('../../utils/audit');
const { sendNotification } = require('../notifications/repository');

async function routes(fastify) {
  // Mark attendance (direct manager)
  fastify.post('/mark', { preHandler: [auth, direct('user_id')] }, async (req) => {
    const { user_id, date, status, remarks } = req.body;
    const att = await repo.markAttendance(user_id, req.user.id, date, status, remarks);
    await createAuditLog({
      userId: req.user.id,
      action: 'ATTENDANCE_MARKED',
      resourceType: 'attendance',
      resourceId: att.id,
      details: { target: user_id, date, status, remarks },
    });
    // Notify the intern (or rated user) if desired
    await sendNotification(user_id, `Your attendance for ${date} has been marked as ${status}.`);
    return att;
  });

  // Get attendance for a user (with ownership check)
  fastify.get('/:userId', { preHandler: [auth, ownership('userId')] }, async (req) => {
    const { from, to } = req.query;
    return repo.getAttendance(req.params.userId, from, to);
  });

  // Monthly stats (requires ownership)
  fastify.get('/:userId/stats', { preHandler: [auth, ownership('userId')] }, async (req) => {
    const { month, year } = req.query;
    if (!month || !year) throw new Error('month and year required');
    return repo.getMonthlyStats(req.params.userId, month, year);
  });
}

module.exports = routes;
