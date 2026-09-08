// plugins/khan.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd, commands } from '../command.js';
import config from '../config.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// Keyword that triggers KHAN (all case variations supported)
const KHANTriggers = ["khan"];

// Gemini API URL
const GEMINI_API_URL = 'https://jerrycoder.oggyapi.workers.dev/ai/gemini';

cmd({
    'on': "body"
}, async (client, message, m, {
    from,
    body,
    isCreator,
    reply,
    sender,
    userConfig,
    isGroup,
    args,
    q,
    text
}) => {
    try {
        // Remove owner-only restriction - Allow in any chat

        // Keep original body for message sending, use lowercase for checking
        const originalBody = body.trim();
        const lowerBody = originalBody.toLowerCase();
        
        // Check if message starts with "KHAN" (case insensitive)
        let cleanMsg = null;
        let matchedTrigger = null;
        let matchedText = null;
        
        for (const trigger of KHANTriggers) {
            // Check if lowerBody starts with trigger
            if (lowerBody.startsWith(trigger)) {
                matchedTrigger = trigger;
                // Remove the trigger from the original body (preserving case)
                const triggerRegex = new RegExp(`^${trigger}`, 'i');
                cleanMsg = originalBody.replace(triggerRegex, '').trim();
                matchedText = originalBody.match(new RegExp(`^${trigger}`, 'i'))[0];
                break;
            }
        }
        
        // If no KHAN trigger found at start, return
        if (!matchedTrigger) {
            return;
        }
        
        // Get PREFIX
        const PREFIX = userConfig?.PREFIX || config.PREFIX || ".";
        
        // If just "KHAN" with no command, show intro with AI assistant message
        if (!cleanMsg) {
            const introText = `🤖 *KHAN:* Hey! I'm KHAN - Your AI Assistant!

*About Me:*
• 🤖 Powered by advanced AI
• 💡 Here to help you 24/7
• 🎯 Fast & accurate responses
• 🔐 Secure & private

📋 *Try these commands:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status
• ${matchedText} <question> - Ask me anything!

💡 *Just type "${matchedText} <your question>" and I'll help!*`;

            await client.sendMessage(from, { 
                text: introText,
                quoted: message // Quote the user's message
            });
            
            // React with 🤖
            try {
                await m.react('🤖');
            } catch (e) {}
            
            return;
        }

        // ===== FIND COMMAND FROM COMMANDS ARRAY =====
        const words = cleanMsg.toLowerCase().split(/\s+/);
        let foundCommand = null;
        let foundArgs = [];
        let commandPattern = null;
        
        // Loop through all registered commands
        for (const cmd of commands) {
            // Get command patterns (could be string or array)
            const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
            const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
            const allNames = [...patterns, ...aliases].filter(Boolean);
            
            // Check if any name matches the FIRST WORD exactly
            for (const name of allNames) {
                if (words[0] === name.toLowerCase()) {
                    foundCommand = cmd;
                    commandPattern = name;
                    foundArgs = words.slice(1);
                    break;
                }
            }
            if (foundCommand) break;
        }
        
        // If command found, execute it
        if (foundCommand && commandPattern) {
            // Send "Ok boss" message with quoted reply
            const okMsg = await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Ok boss! Processing "${commandPattern}"...`,
                quoted: message // Quote the user's message
            });
            
            // React with 🤖
            if (okMsg.key) {
                try {
                    await client.sendMessage(from, {
                        react: {
                            text: '🤖',
                            key: okMsg.key
                        }
                    });
                } catch (e) {}
            }
            
            // Create the context with the command
            const context = {
                from,
                reply,
                sender,
                userConfig,
                isCreator: false,
                isGroup,
                args: foundArgs,
                q: foundArgs.join(' '),
                text: foundArgs.join(' '),
                isCmd: true,
                command: commandPattern
            };
            
            // Execute the command directly
            try {
                await foundCommand.function(client, message, m, context);
            } catch (err) {
                await reply(`❌ Error executing command: ${err.message}`);
            }
            
            return;
        }
        
        // ===== FALLBACK TO GEMINI API =====
        try {
            // Send thinking message with quoted reply
            const thinkingMsg = await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Let me think about that...`,
                quoted: message // Quote the user's message
            });
            
            // React to thinking message
            try {
                await client.sendMessage(from, {
                    react: {
                        text: '🧠',
                        key: thinkingMsg.key
                    }
                });
            } catch (e) {}
            
            // Call Gemini API
            const response = await axios.get(GEMINI_API_URL, {
                params: {
                    prompt: cleanMsg
                },
                timeout: 30000 // 30 second timeout
            });
            
            // Check if response has reply
            if (response.data && response.data.reply) {
                const replyText = `🤖 *KHAN:* ${response.data.reply}`;
                await client.sendMessage(from, { 
                    text: replyText,
                    quoted: message // Quote the user's message
                });
            } else {
                // If no reply in response
                await reply(`🤖 *KHAN:* I couldn't process that. Please try again.`);
            }
            
            // Delete thinking message
            try {
                await client.sendMessage(from, { delete: thinkingMsg.key });
            } catch (e) {}
            
        } catch (error) {
            console.error("Gemini API Error:", error.message);
            
            // Handle API errors
            let errorMessage = `❌ *KHAN Error:* `;
            
            if (error.response) {
                // The request was made and the server responded with a status code
                if (error.response.status === 500) {
                    errorMessage += `The Gemini service is currently unavailable. Please try again later.`;
                } else if (error.response.status === 404) {
                    errorMessage += `The Gemini service could not be found.`;
                } else if (error.response.status === 429) {
                    errorMessage += `Too many requests. Please wait a moment and try again.`;
                } else {
                    errorMessage += `Service error (${error.response.status}). Please try again later.`;
                }
            } else if (error.request) {
                // The request was made but no response was received
                errorMessage += `No response from Gemini service. Please check your internet connection.`;
            } else {
                // Something happened in setting up the request
                errorMessage += `Failed to connect to Gemini service. Please try again.`;
            }
            
            // Send error message with quoted reply
            await client.sendMessage(from, { 
                text: errorMessage,
                quoted: message // Quote the user's message
            });
            
            // Show help as fallback with quoted reply
            await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Try these instead:
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status`,
                quoted: message
            });
        }
        
    } catch (error) {
        console.error("KHAN Plugin Error:", error);
        try {
            await client.sendMessage(from, { 
                text: `❌ KHAN Error: ${error.message}`,
                quoted: message
            });
        } catch (e) {}
    }
});
