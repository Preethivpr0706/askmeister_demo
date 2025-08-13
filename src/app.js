const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const webhookController = require('./controllers/webhookController');
const { validateWebhook } = require('./middleware/validation');

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files (for media)
app.use('/assets', express.static(path.join(__dirname, '../assets')));

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'AskMeister WhatsApp Chatbot Demo API',
        version: '1.0.0',
        status: 'active'
    });
});

// WhatsApp webhook routes
app.get('/webhook', webhookController.verifyWebhook);
app.post('/webhook', webhookController.handleMessage);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 AskMeister WhatsApp Chatbot Demo running on port ${PORT}`);
    console.log(`📱 Webhook URL: http://localhost:${PORT}/webhook`);
});

module.exports = app;