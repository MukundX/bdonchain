# Telegram Bot - User Registration System

A production-ready Telegram bot built with Node.js that collects user information through an interactive conversation flow and forwards completed registrations to admin users.

## 🚀 Features

- **Interactive Conversation Flow**: Step-by-step data collection with inline keyboards
- **User Data Collection**: 
  - Company name
  - X (Twitter) profile URL (optional)
  - LinkedIn profile URL (optional)
  - Company type (Startup/Agency/Individual)
  - What they're looking for
- **Admin Notifications**: Automatic forwarding of completed registrations to admin users
- **Admin Commands**: Send custom messages to any user who has used the bot
- **State Management**: In-memory user state management (easily extensible to Redis/Firebase)
- **Error Handling**: Comprehensive error handling and graceful shutdown
- **Production Ready**: Environment variables, logging, and deployment ready

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- A Telegram bot token (get from [@BotFather](https://t.me/botfather))
- Your Telegram user ID (for admin access)

## 🛠️ Installation

1. **Clone or download the project files**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Copy the example file
   cp env.example .env
   
   # Edit .env with your actual values
   ```

4. **Configure your `.env` file**:
   ```env
   BOT_TOKEN=your_telegram_bot_token_here
   ADMIN_IDS=123456789,987654321
   ```

## 🔧 Configuration

### Getting Your Bot Token

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow the instructions to create your bot
4. Copy the token provided

### Getting Your User ID

1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your user ID
3. Add this ID to the `ADMIN_IDS` environment variable

## 🚀 Running the Bot

### Local Development

```bash
# Install dependencies
npm install

# Start the bot
npm start

# For development with auto-restart
npm run dev
```

### Production Deployment

The bot is ready for deployment on various platforms. See deployment sections below.

## 📱 Bot Usage

### For Users

1. **Start the bot**: Send `/start` to begin the registration process
2. **Follow the prompts**: The bot will ask for information step by step
3. **Confirm submission**: Review your information and confirm
4. **Receive confirmation**: Get a thank you message when complete

### For Admins

- **View registrations**: All completed registrations are automatically forwarded to admin users
- **Send messages**: Use `/message <userId> <text>` to send custom messages to users

## 🌐 Deployment

### Deploy to Render.com (Free Plan)

1. **Create a Render account** at [render.com](https://render.com)

2. **Create a new Web Service**:
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `npm start`
   - Choose the free plan

3. **Configure environment variables** in Render dashboard:
   - `BOT_TOKEN`: Your Telegram bot token
   - `ADMIN_IDS`: Comma-separated list of admin user IDs

4. **Deploy**: Render will automatically deploy your bot

### Deploy to Railway

1. **Create a Railway account** at [railway.app](https://railway.app)

2. **Connect your repository** and create a new service

3. **Set environment variables** in Railway dashboard

4. **Deploy**: Railway will automatically deploy your bot

### Deploy to Heroku

1. **Create a Heroku account** and install Heroku CLI

2. **Create a new app**:
   ```bash
   heroku create your-bot-name
   ```

3. **Set environment variables**:
   ```bash
   heroku config:set BOT_TOKEN=your_token_here
   heroku config:set ADMIN_IDS=123456789,987654321
   ```

4. **Deploy**:
   ```bash
   git push heroku main
   ```

## 🔄 State Management

The bot currently uses in-memory state management. For production with multiple users, consider:

### Redis Integration

```javascript
// Add to package.json dependencies
"redis": "^4.6.0"

// Replace in-memory Map with Redis
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);
```

### Firebase Integration

```javascript
// Add to package.json dependencies
"firebase-admin": "^11.0.0"

// Replace in-memory Map with Firestore
const admin = require('firebase-admin');
const db = admin.firestore();
```

## 🛡️ Security Features

- **Input Validation**: All user inputs are validated and sanitized
- **Admin Authorization**: Only authorized admin IDs can use admin commands
- **Error Handling**: Comprehensive error handling prevents crashes
- **Environment Variables**: Sensitive data stored in environment variables

## 📊 Monitoring

The bot includes basic logging for:
- Bot startup and configuration
- User interactions
- Admin actions
- Errors and exceptions

For production monitoring, consider adding:
- Application performance monitoring (APM)
- Structured logging with timestamps
- Health check endpoints

## 🔧 Customization

### Adding New Fields

1. Update the `STEPS` object in `index.js`
2. Add the field to the user state data structure
3. Handle the new step in `handleTextInput()`
4. Update the confirmation summary

### Modifying Company Types

Edit the `COMPANY_TYPES` array in `index.js`:
```javascript
const COMPANY_TYPES = ['Startup', 'Agency', 'Individual', 'Enterprise', 'Non-Profit'];
```

### Customizing Messages

All bot messages are defined in the code and can be easily customized for your needs.

## 🐛 Troubleshooting

### Common Issues

1. **Bot not responding**:
   - Check if `BOT_TOKEN` is correct
   - Verify the bot is not blocked by users
   - Check server logs for errors

2. **Admin commands not working**:
   - Verify your user ID is in `ADMIN_IDS`
   - Ensure the format is correct (comma-separated numbers)

3. **State issues**:
   - Restart the bot to clear in-memory states
   - For production, implement persistent storage

### Logs

Check the console output for:
- Bot startup messages
- User interaction logs
- Error messages

## 📄 License

MIT License - feel free to use this code for your own projects.

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

---

**Note**: This bot is designed for production use but uses in-memory state management. For high-traffic applications, implement Redis or Firebase for persistent state management. 