-- Database migration for AI Chatbot feature
-- Run this SQL to add chatbot support to your database

-- Create chatbot_conversations table
CREATE TABLE IF NOT EXISTS chatbot_conversations (
  id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(255) UNIQUE NOT NULL,
  user_name VARCHAR(255) DEFAULT 'Guest',
  user_email VARCHAR(255),
  messages JSONB NOT NULL DEFAULT '[]',
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups
CREATE INDEX idx_conversation_id ON chatbot_conversations(conversation_id);
CREATE INDEX idx_created_at ON chatbot_conversations(created_at);
CREATE INDEX idx_email_sent ON chatbot_conversations(email_sent);

-- Add comments for documentation
COMMENT ON TABLE chatbot_conversations IS 'Stores AI chatbot conversation history';
COMMENT ON COLUMN chatbot_conversations.conversation_id IS 'Unique identifier for each conversation session';
COMMENT ON COLUMN chatbot_conversations.messages IS 'JSON array of conversation messages with role, content, and timestamp';
COMMENT ON COLUMN chatbot_conversations.email_sent IS 'Whether the conversation has been emailed to Tysun';

