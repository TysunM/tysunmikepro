/* ============================================================================
   TYSUN MIKE PRODUCTIONS - AI CHATBOT SCRIPT
   Production-ready JavaScript for chatbot widget
   Version: 1.0.0
   ============================================================================ */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        apiUrl: window.CHATBOT_API_URL || 'http://localhost:8000/api/chatbot',
        userName: 'Guest',
        userEmail: null,
        conversationId: null,
        autoOpen: false,
        welcomeDelay: 3000
    };
    
    // DOM Elements
    let elements = {};
    
    // State
    let isOpen = false;
    let isSending = false;
    let messageCount = 0;
    
    /**
     * Initialize chatbot
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initChatbot);
        } else {
            initChatbot();
        }
    }
    
    /**
     * Initialize chatbot elements and event listeners
     */
    function initChatbot() {
        // Get DOM elements
        elements = {
            toggle: document.getElementById('chatbot-toggle'),
            container: document.getElementById('chatbot-container'),
            messages: document.getElementById('chatbot-messages'),
            input: document.getElementById('chatbot-input'),
            sendBtn: document.getElementById('chatbot-send'),
            closeBtn: document.querySelector('.chatbot-close'),
            typingIndicator: document.getElementById('typing-indicator'),
            quickActions: document.getElementById('quick-actions'),
            endChatBtn: document.getElementById('end-chat-btn')
        };
        
        // Check if elements exist
        if (!elements.toggle || !elements.container) {
            console.error('Chatbot: Required elements not found');
            return;
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Auto-resize textarea
        autoResize(elements.input);
        
        // Auto-open if configured
        if (CONFIG.autoOpen) {
            setTimeout(() => {
                toggleChatbot();
                showNotification();
            }, CONFIG.welcomeDelay);
        }
        
        console.log('Chatbot initialized successfully');
    }
    
    /**
     * Setup all event listeners
     */
    function setupEventListeners() {
        // Toggle chatbot
        elements.toggle.addEventListener('click', toggleChatbot);
        if (elements.closeBtn) {
            elements.closeBtn.addEventListener('click', closeChatbot);
        }
        
        // Send message
        elements.sendBtn.addEventListener('click', sendMessage);
        elements.input.addEventListener('keypress', handleKeyPress);
        
        // Auto-resize textarea
        elements.input.addEventListener('input', () => autoResize(elements.input));
        
        // Quick actions
        if (elements.quickActions) {
            elements.quickActions.addEventListener('click', handleQuickAction);
        }
        
        // End chat
        if (elements.endChatBtn) {
            elements.endChatBtn.addEventListener('click', endConversation);
        }
    }
    
    /**
     * Toggle chatbot open/close
     */
    function toggleChatbot() {
        isOpen = !isOpen;
        elements.container.classList.toggle('open', isOpen);
        elements.toggle.classList.toggle('open', isOpen);
        
        if (isOpen) {
            elements.input.focus();
            hideNotification();
        }
    }
    
    /**
     * Close chatbot
     */
    function closeChatbot() {
        isOpen = false;
        elements.container.classList.remove('open');
        elements.toggle.classList.remove('open');
    }
    
    /**
     * Handle Enter key press
     */
    function handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    }
    
    /**
     * Handle quick action button click
     */
    function handleQuickAction(e) {
        if (e.target.classList.contains('quick-action-btn')) {
            const message = e.target.dataset.message;
            elements.input.value = message;
            sendMessage();
        }
    }
    
    /**
     * Send message to API
     */
    async function sendMessage() {
        const message = elements.input.value.trim();
        
        if (!message || isSending) return;
        
        // Add user message to UI
        addMessage(message, 'user');
        elements.input.value = '';
        autoResize(elements.input);
        
        // Hide quick actions after first message
        if (messageCount === 0 && elements.quickActions) {
            elements.quickActions.style.display = 'none';
        }
        
        messageCount++;
        
        // Show typing indicator
        showTyping(true);
        
        // Disable send button
        isSending = true;
        elements.sendBtn.disabled = true;
        
        try {
            // Send to API
            const response = await fetch(`${CONFIG.apiUrl}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    conversationId: CONFIG.conversationId,
                    userName: CONFIG.userName,
                    userEmail: CONFIG.userEmail
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Save conversation ID
            if (data.conversationId) {
                CONFIG.conversationId = data.conversationId;
            }
            
            // Hide typing indicator
            showTyping(false);
            
            // Add assistant response
            addMessage(data.message, 'assistant');
            
        } catch (error) {
            console.error('Error sending message:', error);
            showTyping(false);
            showError('Sorry, I encountered an error. Please try again or contact us at productions@tysunmike.us');
        } finally {
            isSending = false;
            elements.sendBtn.disabled = false;
            elements.input.focus();
        }
    }
    
    /**
     * Add message to chat UI
     */
    function addMessage(content, role) {
        // Remove welcome message if exists
        const welcomeMsg = elements.messages.querySelector('.welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = role === 'user' ? (CONFIG.userName[0] || 'U') : 'TM';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        
        // Support for markdown-like formatting
        const formattedContent = formatMessage(content);
        contentDiv.innerHTML = formattedContent;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = new Date().toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
        });
        contentDiv.appendChild(time);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(contentDiv);
        
        // Insert before typing indicator
        elements.messages.insertBefore(messageDiv, elements.typingIndicator);
        
        // Scroll to bottom
        scrollToBottom();
    }
    
    /**
     * Format message content (basic markdown support)
     */
    function formatMessage(content) {
        // Escape HTML
        const div = document.createElement('div');
        div.textContent = content;
        let formatted = div.innerHTML;
        
        // Convert line breaks
        formatted = formatted.replace(/\n/g, '<br>');
        
        // Bold text **text**
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text *text*
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return formatted;
    }
    
    /**
     * Show/hide typing indicator
     */
    function showTyping(show) {
        if (elements.typingIndicator) {
            elements.typingIndicator.classList.toggle('active', show);
            if (show) {
                scrollToBottom();
            }
        }
    }
    
    /**
     * Show error message
     */
    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        elements.messages.insertBefore(errorDiv, elements.typingIndicator);
        scrollToBottom();
        
        // Remove after 5 seconds
        setTimeout(() => errorDiv.remove(), 5000);
    }
    
    /**
     * End conversation and send transcript
     */
    async function endConversation() {
        if (!CONFIG.conversationId) {
            showError('No active conversation to end.');
            return;
        }
        
        // Show email form
        showEmailForm();
    }
    
    /**
     * Show email form for transcript
     */
    function showEmailForm() {
        const formDiv = document.createElement('div');
        formDiv.className = 'email-form';
        formDiv.innerHTML = `
            <h4>📧 Send Conversation Transcript</h4>
            <input type="text" id="user-name-input" placeholder="Your Name" value="${CONFIG.userName}">
            <input type="email" id="user-email-input" placeholder="Your Email (optional)" value="${CONFIG.userEmail || ''}">
            <div class="email-form-buttons">
                <button class="skip-btn" id="skip-email-btn">Skip</button>
                <button class="submit-btn" id="submit-email-btn">Send</button>
            </div>
        `;
        
        elements.messages.appendChild(formDiv);
        scrollToBottom();
        
        // Add event listeners
        document.getElementById('skip-email-btn').addEventListener('click', () => {
            sendTranscript(null, null);
        });
        
        document.getElementById('submit-email-btn').addEventListener('click', () => {
            const userName = document.getElementById('user-name-input').value;
            const userEmail = document.getElementById('user-email-input').value;
            sendTranscript(userName, userEmail);
        });
    }
    
    /**
     * Send transcript to email
     */
    async function sendTranscript(userName, userEmail) {
        // Remove email form
        const form = document.querySelector('.email-form');
        if (form) form.remove();
        
        // Update config
        if (userName) CONFIG.userName = userName;
        if (userEmail) CONFIG.userEmail = userEmail;
        
        // Show loading
        showTyping(true);
        
        try {
            const response = await fetch(`${CONFIG.apiUrl}/end`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    conversationId: CONFIG.conversationId,
                    userName: CONFIG.userName,
                    userEmail: CONFIG.userEmail
                })
            });
            
            showTyping(false);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Show success message
            addMessage('✅ Conversation transcript sent successfully! We\'ll get back to you soon at productions@tysunmike.us', 'assistant');
            
            // Reset conversation
            CONFIG.conversationId = null;
            messageCount = 0;
            
            // Show quick actions again
            if (elements.quickActions) {
                elements.quickActions.style.display = 'flex';
            }
            
        } catch (error) {
            console.error('Error sending transcript:', error);
            showTyping(false);
            showError('Failed to send transcript. Please contact us directly at productions@tysunmike.us');
        }
    }
    
    /**
     * Auto-resize textarea
     */
    function autoResize(textarea) {
        if (!textarea) return;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    }
    
    /**
     * Scroll messages to bottom
     */
    function scrollToBottom() {
        setTimeout(() => {
            elements.messages.scrollTop = elements.messages.scrollHeight;
        }, 100);
    }
    
    /**
     * Show notification badge
     */
    function showNotification() {
        elements.toggle.classList.add('has-notification');
    }
    
    /**
     * Hide notification badge
     */
    function hideNotification() {
        elements.toggle.classList.remove('has-notification');
    }
    
    /**
     * Public API
     */
    window.TysunChatbot = {
        open: function() {
            if (!isOpen) toggleChatbot();
        },
        close: closeChatbot,
        sendMessage: function(message) {
            if (!message) return;
            elements.input.value = message;
            sendMessage();
        },
        setUser: function(name, email) {
            if (name) CONFIG.userName = name;
            if (email) CONFIG.userEmail = email;
        },
        setApiUrl: function(url) {
            CONFIG.apiUrl = url;
        }
    };
    
    // Initialize
    init();
    
})();

