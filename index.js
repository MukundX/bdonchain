require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

// Configuration
const BOT_TOKEN = process.env.BOT_TOKEN;
const ADMIN_IDS = process.env.ADMIN_IDS ? process.env.ADMIN_IDS.split(',').map(id => parseInt(id.trim())) : [];

if (!BOT_TOKEN) {
    console.error('BOT_TOKEN is required in environment variables');
    process.exit(1);
}

// Create bot instance
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Bot statistics
const botStats = {
    totalUsers: new Set(),
    totalRegistrations: 0,
    weeklyMessages: {
        sent: 0,
        received: 0,
        lastReset: new Date()
    }
};

// Store recent users for admin message selection
const recentUsers = new Map(); // userId -> { name, username, lastSeen }
const MAX_RECENT_USERS = 20; // Maximum number of recent users to show

// Reset weekly stats every Monday
function resetWeeklyStats() {
    const now = new Date();
    const lastReset = new Date(botStats.weeklyMessages.lastReset);
    const daysSinceReset = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    
    if (daysSinceReset >= 7) {
        botStats.weeklyMessages.sent = 0;
        botStats.weeklyMessages.received = 0;
        botStats.weeklyMessages.lastReset = now;
        console.log('Weekly stats reset');
    }
}

// Set bot commands
async function setBotCommands() {
    try {
        await bot.setMyCommands([
            {
                command: 'start',
                description: 'Start the registration process'
            },
            {
                command: 'message',
                description: '🔒 Send message to user/all (Admin only)'
            },
            {
                command: 'stats',
                description: '📊 View bot statistics (Admin only)'
            }
        ]);
        console.log('Bot commands set successfully');
    } catch (error) {
        console.error('Error setting bot commands:', error);
    }
}

// User states for conversation flow
const userStates = new Map();

// Admin message composition states
const adminMessageStates = new Map(); // adminUserId -> { targetUserId, step }

// Conversation steps
const STEPS = {
    WELCOME: 'welcome',
    COMPANY_NAME: 'company_name',
    TWITTER_URL: 'twitter_url',
    LINKEDIN_URL: 'linkedin_url',
    COMPANY_TYPE: 'company_type',
    LOOKING_FOR: 'looking_for',
    CONFIRMATION: 'confirmation'
};

// Admin message steps
const ADMIN_STEPS = {
    SELECT_USER: 'select_user',
    COMPOSE_MESSAGE: 'compose_message'
};

// Company types
const COMPANY_TYPES = ['Startup', 'Agency', 'Individual'];

// Initialize user state
function initializeUserState(userId) {
    userStates.set(userId, {
        step: STEPS.WELCOME,
        data: {
            fullName: '',
            username: '',
            userId: userId,
            companyName: '',
            twitterUrl: '',
            linkedinUrl: '',
            companyType: '',
            lookingFor: ''
        }
    });
}

// Get user state
function getUserState(userId) {
    return userStates.get(userId);
}

// Update user state
function updateUserState(userId, updates) {
    const state = userStates.get(userId);
    if (state) {
        Object.assign(state, updates);
        userStates.set(userId, state);
        console.log(`Updated state for user ${userId}:`, JSON.stringify(state, null, 2));
    } else {
        console.log(`No state found for user ${userId} when trying to update`);
    }
}

// Clear user state
function clearUserState(userId) {
    userStates.delete(userId);
}

// Send message with error handling
async function sendMessage(chatId, text, options = {}) {
    try {
        const result = await bot.sendMessage(chatId, text, options);
        // Track sent messages
        botStats.weeklyMessages.sent++;
        return result;
    } catch (error) {
        console.error(`Error sending message to ${chatId}:`, error.message);
        return null;
    }
}

// Handle skip button clicks
async function handleSkip(chatId, userId, skipType) {
    const state = getUserState(userId);
    if (!state) return;

    if (skipType === 'twitter') {
        state.data.twitterUrl = '';
        updateUserState(userId, { data: state.data, step: STEPS.LINKEDIN_URL });
        
        const linkedinKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⏭️ Skip', callback_data: 'skip:linkedin' }]
                ]
            }
        };
        await sendMessage(chatId, 'What\'s your LinkedIn profile URL?', linkedinKeyboard);
    } else if (skipType === 'linkedin') {
        state.data.linkedinUrl = '';
        updateUserState(userId, { data: state.data, step: STEPS.COMPANY_TYPE });
        
        const companyTypeKeyboard = {
            reply_markup: {
                inline_keyboard: [
                    COMPANY_TYPES.map(type => ({ text: type, callback_data: `company_type:${type}` }))
                ]
            }
        };
        await sendMessage(chatId, 'What type of company are you?', companyTypeKeyboard);
    }
}

// Handle company type selection
async function handleCompanyTypeSelection(chatId, userId, companyType) {
    const state = getUserState(userId);
    if (!state) return;

    state.data.companyType = companyType;
    updateUserState(userId, { data: state.data, step: STEPS.LOOKING_FOR });

    await sendMessage(chatId, 'What are you looking for? Please describe your needs or goals.');
}

// Handle confirmation
async function handleConfirmation(chatId, userId, confirmed) {
    const state = getUserState(userId);
    if (!state) return;

    if (confirmed) {
        console.log(`User ${userId} confirmed registration. Data:`, JSON.stringify(state.data, null, 2));
        
        // Track registration
        botStats.totalRegistrations++;
        
        // Send thank you message
        await sendMessage(chatId, '✅ Your information has been received. We\'ll contact you soon!');

        // Forward to admins
        await forwardToAdmins(userId, state.data);

        // Clear user state
        clearUserState(userId);
    } else {
        // Cancel and clear state
        await sendMessage(chatId, '❌ Your information has been discarded. You can start over with /start');
        clearUserState(userId);
    }
}

// Forward user data to admins
async function forwardToAdmins(userId, userData) {
    const adminMessage = `🔔 New User Registration

👤 User Information:
• Full Name: ${userData.fullName}
• Username: @${userData.username}
• User ID: \`${userData.userId}\`

🏢 Company Information:
• Company Name: ${userData.companyName}
• Company Type: ${userData.companyType}
• X (Twitter): ${userData.twitterUrl || 'Not provided'}
• LinkedIn: ${userData.linkedinUrl || 'Not provided'}

🎯 Looking For: ${userData.lookingFor}`;

    for (const adminId of ADMIN_IDS) {
        try {
            await sendMessage(adminId, adminMessage, { parse_mode: 'Markdown' });
        } catch (error) {
            console.error(`Error forwarding to admin ${adminId}:`, error.message);
        }
    }
}

// Handle text input based on current step
async function handleTextInput(chatId, userId, text) {
    const state = getUserState(userId);
    if (!state) {
        console.log(`No state found for user ${userId}`);
        return;
    }

    console.log(`Processing text input for user ${userId}, step: ${state.step}, text: "${text}"`);

    switch (state.step) {
        case STEPS.COMPANY_NAME:
            state.data.companyName = text;
            console.log(`Updated company name for user ${userId}: "${text}"`);
            updateUserState(userId, { data: state.data, step: STEPS.TWITTER_URL });
            
            const twitterKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⏭️ Skip', callback_data: 'skip:twitter' }]
                    ]
                }
            };
            await sendMessage(chatId, 'What\'s your X (Twitter) profile URL?', twitterKeyboard);
            break;

        case STEPS.TWITTER_URL:
            if (text.toLowerCase() === 'skip') {
                state.data.twitterUrl = '';
            } else {
                state.data.twitterUrl = text;
            }
            console.log(`Updated Twitter URL for user ${userId}: "${state.data.twitterUrl}"`);
            updateUserState(userId, { data: state.data, step: STEPS.LINKEDIN_URL });
            
            const linkedinKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '⏭️ Skip', callback_data: 'skip:linkedin' }]
                    ]
                }
            };
            await sendMessage(chatId, 'What\'s your LinkedIn profile URL?', linkedinKeyboard);
            break;

        case STEPS.LINKEDIN_URL:
            if (text.toLowerCase() === 'skip') {
                state.data.linkedinUrl = '';
            } else {
                state.data.linkedinUrl = text;
            }
            console.log(`Updated LinkedIn URL for user ${userId}: "${state.data.linkedinUrl}"`);
            updateUserState(userId, { data: state.data, step: STEPS.COMPANY_TYPE });
            
            const companyTypeKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        COMPANY_TYPES.map(type => ({ text: type, callback_data: `company_type:${type}` }))
                    ]
                }
            };
            await sendMessage(chatId, 'What type of company are you?', companyTypeKeyboard);
            break;

        case STEPS.LOOKING_FOR:
            state.data.lookingFor = text;
            console.log(`Updated looking for for user ${userId}: "${text}"`);
            updateUserState(userId, { data: state.data, step: STEPS.CONFIRMATION });

            // Show summary for confirmation
            const summary = `📋 Please confirm your information:

👤 Name: ${state.data.fullName}
🏢 Company: ${state.data.companyName}
🏢 Type: ${state.data.companyType}
🐦 X (Twitter): ${state.data.twitterUrl || 'Not provided'}
💼 LinkedIn: ${state.data.linkedinUrl || 'Not provided'}
🎯 Looking for: ${state.data.lookingFor}`;

            const confirmKeyboard = {
                reply_markup: {
                    inline_keyboard: [
                        [
                            { text: '✅ Confirm', callback_data: 'confirm:yes' },
                            { text: '❌ Cancel', callback_data: 'confirm:no' }
                        ]
                    ]
                }
            };
            await sendMessage(chatId, summary, confirmKeyboard);
            break;
    }
}

// Handle /start command
async function handleStart(chatId, user) {
    console.log(`Starting conversation with user ${user.id}: ${user.first_name} ${user.last_name || ''}`);
    
    // Initialize user state
    initializeUserState(user.id);
    
    // Update user info
    const state = getUserState(user.id);
    if (!state) {
        console.error(`Failed to get state for user ${user.id}`);
        return;
    }
    
    state.data.fullName = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    state.data.username = user.username || '';
    state.data.userId = user.id;
    updateUserState(user.id, { data: state.data, step: STEPS.COMPANY_NAME });

    const welcomeMessage = `👋 Welcome, ${user.first_name}!

I'll help you register with us. Let me collect some information about you and your company.

First, what's your company name?`;
    
    await sendMessage(chatId, welcomeMessage);
}

// Handle admin message command
async function handleAdminMessage(chatId, userId, messageText) {
    if (!ADMIN_IDS.includes(userId)) {
        await sendMessage(chatId, '❌ You are not authorized to use this command.');
        return;
    }

    // Check if it's just /message (show user selection)
    if (messageText.trim() === '/message') {
        await showUserSelection(chatId);
        return;
    }

    // Remove the /message command from the text
    const textWithoutCommand = messageText.replace(/^\/message\s+/, '');
    const parts = textWithoutCommand.split(' ');
    
    if (parts.length < 2) {
        await sendMessage(chatId, '❌ Usage: /message <userId> <text> or /message all <text>');
        return;
    }

    const target = parts[0].toLowerCase();
    const text = parts.slice(1).join(' ');

    if (!text.trim()) {
        await sendMessage(chatId, '❌ Message text cannot be empty');
        return;
    }

    // Handle "all" command
    if (target === 'all') {
        await sendMessageToAll(chatId, text);
        return;
    }

    // Handle specific user ID
    const targetUserId = parseInt(target);
    if (isNaN(targetUserId)) {
        await sendMessage(chatId, '❌ Invalid user ID. Use /message all <text> to send to all users.');
        return;
    }

    try {
        await sendMessage(targetUserId, `📨 Message from admin:\n\n${text}`);
        await sendMessage(chatId, `✅ Message sent to user \`${targetUserId}\``, { parse_mode: 'Markdown' });
    } catch (error) {
        console.error(`Error sending admin message to ${targetUserId}:`, error);
        await sendMessage(chatId, `❌ Failed to send message to user \`${targetUserId}\`: ${error.message}`, { parse_mode: 'Markdown' });
    }
}

// Show user selection for admin message
async function showUserSelection(chatId) {
    if (recentUsers.size === 0) {
        await sendMessage(chatId, '📭 No recent users found. Users will appear here after they interact with the bot.');
        return;
    }

    // Sort users by last seen (most recent first)
    const sortedUsers = Array.from(recentUsers.entries())
        .sort((a, b) => b[1].lastSeen - a[1].lastSeen)
        .slice(0, 10); // Show only 10 most recent users

    const keyboard = [];
    for (const [userId, userData] of sortedUsers) {
        const displayName = userData.username ? `@${userData.username}` : userData.name;
        const buttonText = `${displayName} (${userId})`;
        keyboard.push([{ text: buttonText, callback_data: `select_user:${userId}` }]);
    }

    // Add "Send to All" button
    keyboard.push([{ text: '📢 Send to All Users', callback_data: 'send_to_all' }]);

    const message = `📨 Select a user to send a message to:\n\nRecent users (${sortedUsers.length}/${recentUsers.size}):`;
    
    await sendMessage(chatId, message, {
        reply_markup: {
            inline_keyboard: keyboard
        }
    });
}

// Send message to all recent users
async function sendMessageToAll(adminChatId, messageText) {
    if (recentUsers.size === 0) {
        await sendMessage(adminChatId, '📭 No users to send message to.');
        return;
    }

    const users = Array.from(recentUsers.keys());
    let successCount = 0;
    let failCount = 0;
    const failedUsers = [];

    // Send message to all users
    for (const userId of users) {
        try {
            await sendMessage(userId, `📢 Announcement from admin:\n\n${messageText}`);
            successCount++;
        } catch (error) {
            console.error(`Error sending message to user ${userId}:`, error);
            failCount++;
            failedUsers.push(userId);
        }
    }

    // Send summary to admin
    const summary = `📢 Message sent to all users:

✅ Successfully sent: ${successCount} users
❌ Failed to send: ${failCount} users

${failCount > 0 ? `Failed user IDs: ${failedUsers.join(', ')}` : ''}`;

    await sendMessage(adminChatId, summary);
}

// Handle user selection for admin message
async function handleUserSelection(chatId, adminUserId, targetUserId) {
    const userData = recentUsers.get(parseInt(targetUserId));
    if (!userData) {
        await sendMessage(chatId, '❌ User not found in recent users list.');
        return;
    }

    // Set admin message state
    adminMessageStates.set(adminUserId, {
        targetUserId: parseInt(targetUserId),
        step: ADMIN_STEPS.COMPOSE_MESSAGE
    });

    const displayName = userData.username ? `@${userData.username}` : userData.name;
    const message = `📝 Composing message to: ${displayName} (\`${targetUserId}\`)\n\nPlease type your message:`;
    
    await sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

// Handle send to all button
async function handleSendToAll(chatId, adminUserId) {
    if (recentUsers.size === 0) {
        await sendMessage(chatId, '📭 No users to send message to.');
        return;
    }

    // Set admin message state for "all" mode
    adminMessageStates.set(adminUserId, {
        targetUserId: 'all',
        step: ADMIN_STEPS.COMPOSE_MESSAGE
    });

    const message = `📢 Composing announcement to all users (${recentUsers.size} users)\n\nPlease type your announcement message:`;
    
    await sendMessage(chatId, message);
}

// Handle admin message composition
async function handleAdminMessageComposition(chatId, adminUserId, messageText) {
    const adminState = adminMessageStates.get(adminUserId);
    if (!adminState || adminState.step !== ADMIN_STEPS.COMPOSE_MESSAGE) {
        return false; // Not in message composition mode
    }

    const targetUserId = adminState.targetUserId;

    // Handle "all" case
    if (targetUserId === 'all') {
        await sendMessageToAll(chatId, messageText);
        // Clear admin message state
        adminMessageStates.delete(adminUserId);
        return true; // Message handled
    }

    // Handle specific user
    const userData = recentUsers.get(targetUserId);

    try {
        await sendMessage(targetUserId, `📨 Message from admin:\n\n${messageText}`);
        
        const displayName = userData ? (userData.username ? `@${userData.username}` : userData.name) : `User ${targetUserId}`;
        await sendMessage(chatId, `✅ Message sent to ${displayName} (\`${targetUserId}\`)`, { parse_mode: 'Markdown' });
        
        // Clear admin message state
        adminMessageStates.delete(adminUserId);
        return true; // Message handled
    } catch (error) {
        console.error(`Error sending admin message to ${targetUserId}:`, error);
        await sendMessage(chatId, `❌ Failed to send message to user \`${targetUserId}\`: ${error.message}`, { parse_mode: 'Markdown' });
        
        // Clear admin message state
        adminMessageStates.delete(adminUserId);
        return true; // Message handled
    }
}

// Handle admin stats command
async function handleAdminStats(chatId, userId) {
    if (!ADMIN_IDS.includes(userId)) {
        await sendMessage(chatId, '❌ You are not authorized to use this command.');
        return;
    }

    // Reset weekly stats if needed
    resetWeeklyStats();

    const statsMessage = `📊 Bot Statistics

👥 Total Users: ${botStats.totalUsers.size}
✅ Total Registrations: ${botStats.totalRegistrations}

📈 This Week:
• Messages Sent: ${botStats.weeklyMessages.sent}
• Messages Received: ${botStats.weeklyMessages.received}

📅 Last Reset: ${new Date(botStats.weeklyMessages.lastReset).toLocaleDateString()}`;

    await sendMessage(chatId, statsMessage);
}

// Bot event handlers
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Ignore messages without text
    if (!text) return;

    // Track received messages
    botStats.weeklyMessages.received++;
    botStats.totalUsers.add(userId);
    
    // Track recent users for admin message selection
    const userName = msg.from.first_name + (msg.from.last_name ? ' ' + msg.from.last_name : '');
    recentUsers.set(userId, {
        name: userName,
        username: msg.from.username || '',
        lastSeen: new Date()
    });
    
    // Keep only recent users (remove oldest if exceeding limit)
    if (recentUsers.size > MAX_RECENT_USERS) {
        const oldestUser = Array.from(recentUsers.entries())
            .sort((a, b) => a[1].lastSeen - b[1].lastSeen)[0];
        recentUsers.delete(oldestUser[0]);
    }

    try {
        // Handle commands
        if (text.startsWith('/')) {
            if (text === '/start') {
                await handleStart(chatId, msg.from);
            } else if (text.startsWith('/message ')) {
                await handleAdminMessage(chatId, userId, text);
            } else if (text === '/stats') {
                await handleAdminStats(chatId, userId);
            }
            return;
        }

        // Handle regular text input
        const state = getUserState(userId);
        
        // Check if admin is composing a message
        if (ADMIN_IDS.includes(userId)) {
            const messageHandled = await handleAdminMessageComposition(chatId, userId, text);
            if (messageHandled) {
                return; // Message was handled by admin composition
            }
        }
        
        if (state && state.step !== STEPS.WELCOME && state.step !== STEPS.COMPANY_TYPE) {
            await handleTextInput(chatId, userId, text);
        } else if (!state) {
            await sendMessage(chatId, 'Please start the conversation with /start');
        }
    } catch (error) {
        console.error('Error handling message:', error);
        await sendMessage(chatId, 'Sorry, something went wrong. Please try again.');
    }
});

// Handle callback queries (inline keyboard buttons)
bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    try {
        if (data.startsWith('company_type:')) {
            const companyType = data.split(':')[1];
            await handleCompanyTypeSelection(chatId, userId, companyType);
        } else if (data.startsWith('confirm:')) {
            const confirmed = data.split(':')[1] === 'yes';
            await handleConfirmation(chatId, userId, confirmed);
        } else if (data.startsWith('skip:')) {
            const skipType = data.split(':')[1];
            await handleSkip(chatId, userId, skipType);
        } else if (data.startsWith('select_user:')) {
            const targetUserId = data.split(':')[1];
            await handleUserSelection(chatId, userId, targetUserId);
        } else if (data === 'send_to_all') {
            await handleSendToAll(chatId, userId);
        }

        // Answer callback query to remove loading state
        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('Error handling callback query:', error);
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Error occurred' });
    }
});

// Error handling
bot.on('error', (error) => {
    console.error('Bot error:', error);
});

bot.on('polling_error', (error) => {
    console.error('Polling error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('Shutting down bot...');
    bot.stopPolling();
    process.exit(0);
});

// Start the bot
console.log('🤖 Telegram bot is starting...');
console.log(`👥 Admin IDs: ${ADMIN_IDS.join(', ')}`);

// Set bot commands
setBotCommands().then(() => {
    console.log('✅ Bot is running. Press Ctrl+C to stop.');
}).catch(error => {
    console.error('Error setting bot commands:', error);
    console.log('✅ Bot is running. Press Ctrl+C to stop.');
}); 