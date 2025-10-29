import express from 'express';
import nodemailer from 'nodemailer';
import { db } from '../db.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Email transporter setup using SendGrid
const transporter = nodemailer.createTransport({
  host: 'smtp.sendgrid.net',
  port: 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY
  }
});

// System prompt that defines the chatbot's personality and knowledge
const SYSTEM_PROMPT = `You are an AI assistant for Tysun Mike Productions, a professional audio engineering and creative services company. You are helpful, friendly, knowledgeable, and conversational.

ABOUT TYSUN MIKE PRODUCTIONS:
- Professional mixing and mastering services for independent artists
- Logo and album art design services
- Website building for artists and creatives
- 10+ years of experience, 500+ tracks mixed
- 98% client satisfaction rate
- Industry-standard tools: Pro Tools HDX, SSL, Waves, FabFilter, Universal Audio

SERVICES & PRICING:

MIXING SERVICES:
- Basic Mix: $150/track (up to 10 tracks, 2 revisions, 3-day turnaround)
- Pro Mix: $250/track (up to 20 tracks, 3 revisions, 5-day turnaround)
- Full Master Mix: $400/track (unlimited tracks, unlimited revisions, 7-day turnaround, includes mastering)

MASTERING SERVICES:
- Single Master: $75/track (1 revision, 24-48 hour turnaround)
- EP Master: $250 (up to 5 tracks, 2 revisions, 3-day turnaround)
- Album Master: $500 (up to 12 tracks, unlimited revisions, 5-day turnaround)

DESIGN SERVICES:
- Logo Design: Starting at $200 (3 concepts, unlimited revisions)
- Album Art: Starting at $200 (3 concepts, unlimited revisions)
- Full Brand Package: Starting at $500

WEBSITE BUILDING:
- Landing Page: Starting at $500
- Full Website: Starting at $1,500
- E-commerce Store: Starting at $2,500

WHAT'S INCLUDED:
- Professional-grade processing with industry-standard tools
- Multiple revision rounds (varies by package)
- High-quality file delivery (WAV, MP3, FLAC)
- Direct communication with Tysun
- Fast, reliable turnaround
- Satisfaction guaranteed

SPECIALTIES:
- Genres: Hip-Hop, R&B, Pop, Electronic, Rock, Indie, Singer-Songwriter
- Vocal mixing and tuning
- Streaming optimization (-14 LUFS)
- Before/after comparisons available

HOW TO BOOK:
1. Sign up at /signup
2. Choose your service and package
3. Upload files through the secure portal
4. Receive your professional results

CONTACT:
- Email: productions@tysunmike.us
- Response time: Usually within 24 hours

YOUR PERSONALITY:
- Be conversational and friendly, not robotic
- Use natural language, contractions, and occasional enthusiasm
- Ask clarifying questions when needed
- Provide specific, helpful information
- If you don't know something, admit it and offer to connect them with Tysun
- Encourage booking but don't be pushy
- Show genuine interest in their music and projects
- Use music industry terminology appropriately

HANDLING COMMON QUESTIONS:
- File formats: Accept WAV, AIFF, MP3, FLAC (prefer 24-bit WAV)
- Turnaround: Varies by package (3-7 days standard, rush available)
- Revisions: Included in all packages (number varies)
- Payment: Accepted through the portal (credit card, PayPal)
- Refunds: Satisfaction guaranteed, work until client is happy
- Rush service: Available for additional $50-100 fee

If someone asks about booking, guide them to sign up at /signup or contact productions@tysunmike.us.

Always be helpful, professional, and genuinely interested in helping artists achieve their goals.`;

// Store conversation history in memory (in production, use Redis or database)
const conversationStore = new Map();

// POST /api/chatbot/message - Send a message to the chatbot
router.post('/message', async (req, res) => {
  try {
    const { message, conversationId, userName, userEmail } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Generate or use existing conversation ID
    const convId = conversationId || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get or create conversation history
    let conversation = conversationStore.get(convId) || {
      id: convId,
      messages: [],
      userName: userName || 'Guest',
      userEmail: userEmail || null,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      geminiChat: null
    };

    // Initialize Gemini chat session if not exists
    if (!conversation.geminiChat) {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash-exp",
        systemInstruction: SYSTEM_PROMPT,
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 1024,
        }
      });
      
      conversation.geminiChat = model.startChat({
        history: [],
      });
    }

    // Add user message to history
    conversation.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Send message to Gemini
    const result = await conversation.geminiChat.sendMessage(message);
    const assistantMessage = result.response.text();

    // Add assistant response to history
    conversation.messages.push({
      role: 'assistant',
      content: assistantMessage,
      timestamp: new Date()
    });

    // Update conversation metadata
    conversation.lastMessageAt = new Date();
    if (userName) conversation.userName = userName;
    if (userEmail) conversation.userEmail = userEmail;

    // Store updated conversation
    conversationStore.set(convId, conversation);

    // Save to database for persistence
    try {
      await db.query(
        `INSERT INTO chatbot_conversations (conversation_id, user_name, user_email, messages, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (conversation_id) 
         DO UPDATE SET messages = $4, updated_at = $6, user_name = $2, user_email = $3`,
        [
          convId,
          conversation.userName,
          conversation.userEmail,
          JSON.stringify(conversation.messages),
          conversation.startedAt,
          conversation.lastMessageAt
        ]
      );
    } catch (dbError) {
      console.error('Error saving conversation to database:', dbError);
      // Continue even if DB save fails
    }

    res.json({
      conversationId: convId,
      message: assistantMessage,
      timestamp: new Date()
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Handle specific Gemini API errors
    let errorMessage = 'Sorry, I encountered an error. Please try again or contact us directly at productions@tysunmike.us';
    
    if (error.message && error.message.includes('API key')) {
      errorMessage = 'Configuration error. Please contact support.';
    } else if (error.message && error.message.includes('quota')) {
      errorMessage = 'Service temporarily unavailable. Please try again in a moment or email productions@tysunmike.us';
    }
    
    res.status(500).json({ error: errorMessage });
  }
});

// POST /api/chatbot/end - End conversation and send email
router.post('/end', async (req, res) => {
  try {
    const { conversationId, userEmail, userName } = req.body;

    if (!conversationId) {
      return res.status(400).json({ error: 'Conversation ID is required' });
    }

    // Get conversation from store or database
    let conversation = conversationStore.get(conversationId);
    
    if (!conversation) {
      // Try to fetch from database
      const result = await db.query(
        'SELECT * FROM chatbot_conversations WHERE conversation_id = $1',
        [conversationId]
      );
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        conversation = {
          id: row.conversation_id,
          userName: row.user_name,
          userEmail: row.user_email,
          messages: row.messages,
          startedAt: row.created_at,
          lastMessageAt: row.updated_at
        };
      }
    }

    if (!conversation || conversation.messages.length === 0) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    // Update with provided email/name if available
    if (userEmail) conversation.userEmail = userEmail;
    if (userName) conversation.userName = userName;

    // Format conversation for email
    const conversationText = conversation.messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const speaker = msg.role === 'user' ? conversation.userName : 'Tysun AI Assistant';
        return `[${time}] ${speaker}:\n${msg.content}\n`;
      })
      .join('\n');

    // Create HTML version
    const conversationHtml = conversation.messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleString();
        const speaker = msg.role === 'user' ? conversation.userName : 'Tysun AI Assistant';
        const bgColor = msg.role === 'user' ? '#f0f0f0' : '#e3f9f4';
        return `
          <div style="margin: 15px 0; padding: 15px; background: ${bgColor}; border-radius: 8px;">
            <strong style="color: #333;">${speaker}</strong>
            <span style="color: #999; font-size: 12px; margin-left: 10px;">${time}</span>
            <p style="margin: 10px 0 0 0; color: #333; line-height: 1.6;">${msg.content.replace(/\n/g, '<br>')}</p>
          </div>
        `;
      })
      .join('');

    // Send email to Tysun
    const mailOptions = {
      from: process.env.MAIL_FROM || 'noreply@tysunmike.us',
      to: 'productions@tysunmike.us',
      subject: `💬 New Chatbot Conversation from ${conversation.userName}`,
      text: `
New chatbot conversation received!

User: ${conversation.userName}
Email: ${conversation.userEmail || 'Not provided'}
Started: ${new Date(conversation.startedAt).toLocaleString()}
Ended: ${new Date(conversation.lastMessageAt).toLocaleString()}
Messages: ${conversation.messages.length}

CONVERSATION:
${conversationText}

---
This conversation was automatically sent from your website chatbot.
Reply directly to this email if the user provided their email address.
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { background: #0a0a0a; color: #00FFC8; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .info { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            .info-item { margin: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .conversation { margin-top: 20px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2 style="margin: 0;">💬 New Chatbot Conversation</h2>
              <p style="margin: 5px 0 0 0; opacity: 0.8;">Powered by Google Gemini AI</p>
            </div>
            
            <div class="info">
              <div class="info-item"><span class="label">User:</span> ${conversation.userName}</div>
              <div class="info-item"><span class="label">Email:</span> ${conversation.userEmail || 'Not provided'}</div>
              <div class="info-item"><span class="label">Started:</span> ${new Date(conversation.startedAt).toLocaleString()}</div>
              <div class="info-item"><span class="label">Ended:</span> ${new Date(conversation.lastMessageAt).toLocaleString()}</div>
              <div class="info-item"><span class="label">Total Messages:</span> ${conversation.messages.length}</div>
            </div>

            <div class="conversation">
              <h3>Conversation Transcript:</h3>
              ${conversationHtml}
            </div>

            <div class="footer">
              <p>This conversation was automatically sent from your website chatbot.</p>
              <p>If the user provided their email address, you can reply directly to follow up.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      replyTo: conversation.userEmail || undefined
    };

    await transporter.sendMail(mailOptions);

    // Mark conversation as sent in database
    await db.query(
      'UPDATE chatbot_conversations SET email_sent = true, email_sent_at = $1 WHERE conversation_id = $2',
      [new Date(), conversationId]
    );

    // Clean up from memory store (keep in DB for records)
    conversationStore.delete(conversationId);

    res.json({ 
      success: true, 
      message: 'Conversation sent successfully' 
    });

  } catch (error) {
    console.error('Error ending conversation:', error);
    res.status(500).json({ 
      error: 'Failed to send conversation. Please contact us directly at productions@tysunmike.us' 
    });
  }
});

// GET /api/chatbot/history/:conversationId - Get conversation history
router.get('/history/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Try memory store first
    let conversation = conversationStore.get(conversationId);

    // If not in memory, try database
    if (!conversation) {
      const result = await db.query(
        'SELECT * FROM chatbot_conversations WHERE conversation_id = $1',
        [conversationId]
      );

      if (result.rows.length > 0) {
        const row = result.rows[0];
        conversation = {
          id: row.conversation_id,
          userName: row.user_name,
          userEmail: row.user_email,
          messages: row.messages,
          startedAt: row.created_at,
          lastMessageAt: row.updated_at
        };
      }
    }

    if (!conversation) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    res.json({
      conversationId: conversation.id,
      messages: conversation.messages,
      userName: conversation.userName,
      startedAt: conversation.startedAt
    });

  } catch (error) {
    console.error('Error fetching conversation history:', error);
    res.status(500).json({ error: 'Failed to fetch conversation history' });
  }
});

// Cleanup old conversations from memory (run periodically)
setInterval(() => {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  for (const [id, conv] of conversationStore.entries()) {
    if (now - new Date(conv.lastMessageAt).getTime() > maxAge) {
      conversationStore.delete(id);
    }
  }
}, 60 * 60 * 1000); // Run every hour

export default router;

