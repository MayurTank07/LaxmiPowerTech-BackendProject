module.exports = (req, res, next) => {
  const apiKey = req.header('x-api-key') || req.query.apiKey;
  if (!apiKey || apiKey !== process.env.API_KEY) {
    return res.status(401).json({ message: 'Unauthorized: Invalid API key' });
  }
  next();
};
