/**
 * GET /api — 健康检查
 */
export default (req, res) => {
  res.status(200).json({
    code: 200,
    data: { status: 'ok' },
    msg: 'AI Word Memory API is running',
  });
};
