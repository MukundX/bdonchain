#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('🤖 Telegram Bot Setup\n');

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function setup() {
    try {
        // Check if .env already exists
        if (fs.existsSync('.env')) {
            const overwrite = await question('.env file already exists. Overwrite? (y/N): ');
            if (overwrite.toLowerCase() !== 'y') {
                console.log('Setup cancelled.');
                rl.close();
                return;
            }
        }

        console.log('\n📋 Configuration Setup\n');

        // Get bot token
        const botToken = await question('Enter your Telegram bot token: ');
        if (!botToken.trim()) {
            console.log('❌ Bot token is required!');
            rl.close();
            return;
        }

        // Get admin IDs
        const adminIds = await question('Enter admin user IDs (comma-separated): ');
        if (!adminIds.trim()) {
            console.log('❌ At least one admin ID is required!');
            rl.close();
            return;
        }

        // Create .env content
        const envContent = `# Telegram Bot Configuration
BOT_TOKEN=${botToken.trim()}

# Admin Configuration (comma-separated list of Telegram user IDs)
ADMIN_IDS=${adminIds.trim()}

# Optional: Redis Configuration (for production state management)
# REDIS_URL=redis://localhost:6379

# Optional: Firebase Configuration (for production state management)
# FIREBASE_PROJECT_ID=your_project_id
# FIREBASE_PRIVATE_KEY=your_private_key
# FIREBASE_CLIENT_EMAIL=your_client_email
`;

        // Write .env file
        fs.writeFileSync('.env', envContent);

        console.log('\n✅ Configuration saved to .env file!');
        console.log('\n📦 Installing dependencies...');

        // Install dependencies
        const { execSync } = require('child_process');
        try {
            execSync('npm install', { stdio: 'inherit' });
            console.log('\n✅ Dependencies installed successfully!');
        } catch (error) {
            console.log('\n❌ Failed to install dependencies. Please run "npm install" manually.');
        }

        console.log('\n🚀 Setup complete!');
        console.log('\nTo start the bot:');
        console.log('  npm start');
        console.log('\nFor development with auto-restart:');
        console.log('  npm run dev');
        console.log('\n📖 See README.md for deployment instructions.');

    } catch (error) {
        console.error('❌ Setup failed:', error.message);
    } finally {
        rl.close();
    }
}

setup(); 