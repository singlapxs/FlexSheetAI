const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Basic Route
app.get('/', (req, res) => {
  res.send('FlexSheet AI API is running...');
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/workspaces', require('./routes/workspaceRoutes'));

// Nested routes setup
const registerRouter = require('./routes/registerRoutes');
const rowRouter = require('./routes/rowRoutes');
const exportRouter = require('./routes/exportRoutes');
const uploadRouter = require('./routes/uploadRoutes');

app.use('/api/workspaces/:workspaceId/registers', registerRouter);
app.use('/api/registers', registerRouter); // Allows fetching by ID globally
app.use('/api/registers/:registerId/rows', rowRouter);
app.use('/api/registers/:registerId/export', exportRouter);
app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
