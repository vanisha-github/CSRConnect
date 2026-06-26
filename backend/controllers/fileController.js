const https = require('https');

exports.downloadFile = async (req, res, next) => {
  try {
    const { url, name } = req.query;
    if (!url) return res.status(400).json({ error: 'url query param required' });

    const safeName = name ? encodeURIComponent(name) : 'download';
    https.get(url, (remoteRes) => {
      res.setHeader('Content-Disposition', `attachment; filename="${safeName}"`);
      res.setHeader('Content-Type', remoteRes.headers['content-type'] || 'application/octet-stream');
      remoteRes.pipe(res);
    }).on('error', (err) => next(err));
  } catch (error) {
    next(error);
  }
};
