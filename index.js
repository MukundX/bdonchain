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

// User states for conversation flow
const userStates = new Map();

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
    }
}

// Clear user state
function clearUserState(userId) {
    userStates.delete(userId);
}

// Send message with error handling
async function sendMessage(chatId, text, options = {}) {
    try {
        return await bot.sendMessage(chatId, text, options);
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
• User ID: ${userData.userId}

🏢 Company Information:
• Company Name: ${userData.companyName}
• Company Type: ${userData.companyType}
• X (Twitter): ${userData.twitterUrl || 'Not provided'}
• LinkedIn: ${userData.linkedinUrl || 'Not provided'}

🎯 Looking For: ${userData.lookingFor}`;

    for (const adminId of ADMIN_IDS) {
        try {
            await sendMessage(adminId, adminMessage);
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
    // Initialize user state
    initializeUserState(user.id);
    
    // Update user info
    const state = getUserState(user.id);
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

    // Remove the /message command from the text
    const textWithoutCommand = messageText.replace(/^\/message\s+/, '');
    const parts = textWithoutCommand.split(' ');
    
    if (parts.length < 2) {
        await sendMessage(chatId, '❌ Usage: /message <userId> <text>');
        return;
    }

    const targetUserId = parseInt(parts[0]);
    const text = parts.slice(1).join(' ');

    if (isNaN(targetUserId)) {
        await sendMessage(chatId, '❌ Invalid user ID');
        return;
    }

    if (!text.trim()) {
        await sendMessage(chatId, '❌ Message text cannot be empty');
        return;
    }

    try {
        await sendMessage(targetUserId, `📨 Message from admin:\n\n${text}`);
        await sendMessage(chatId, `✅ Message sent to user ${targetUserId}`);
    } catch (error) {
        console.error(`Error sending admin message to ${targetUserId}:`, error);
        await sendMessage(chatId, `❌ Failed to send message to user ${targetUserId}: ${error.message}`);
    }
}

// Bot event handlers
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Ignore messages without text
    if (!text) return;

    try {
        // Handle commands
        if (text.startsWith('/')) {
            if (text === '/start') {
                await handleStart(chatId, msg.from);
            } else if (text.startsWith('/message ')) {
                await handleAdminMessage(chatId, userId, text);
            }
            return;
        }

        // Handle regular text input
        const state = getUserState(userId);
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
console.log('✅ Bot is running. Press Ctrl+C to stop.'); 