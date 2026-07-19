/**
 * GET /api — 健康检查
 */
module.exports = (req, res) => {
  res.status(200).json({
    code: 200,
    data: { status: 'ok' },
    msg: 'AI Word Memory API is running',
  });
};
