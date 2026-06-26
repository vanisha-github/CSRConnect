const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth');
const ngoRoutes = require('./routes/ngo');
const projectRoutes = require('./routes/project');
const updateRoutes = require('./routes/update');
const documentRoutes = require('./routes/document');
const analyticsRoutes = require('./routes/analytics');
const companyRoutes = require('./routes/company');
const publicRoutes = require('./routes/public');
const fileRoutes = require('./routes/file');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/ngos', ngoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/updates', updateRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/files', fileRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
