#!/bin/bash

echo "🤖 Installing AI Chatbot Dependencies..."
echo ""

# Install OpenAI SDK
echo "📦 Installing OpenAI SDK..."
npm install openai

# Verify nodemailer is installed (should already be there)
echo "📧 Verifying nodemailer..."
npm install nodemailer

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Add OPENAI_API_KEY to your .env file"
echo "2. Run the database migration: psql \$DATABASE_URL < db_chatbot_migration.sql"
echo "3. Add chatbot CSS and JS to your HTML pages"
echo "4. Restart your server: npm start"
echo ""
echo "See CHATBOT_SETUP_GUIDE.md for detailed instructions."
