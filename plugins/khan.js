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
                quoted: message
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
                quoted: message
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
                quoted: message
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
            
            // FIX: Properly encode the prompt parameter
            const encodedPrompt = encodeURIComponent(cleanMsg);
            const apiUrl = `${GEMINI_API_URL}?prompt=${encodedPrompt}`;
            
            console.log(`📡 Calling Gemini API: ${apiUrl}`);
            
            // Call Gemini API with proper headers
            const response = await axios.get(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });
            
            console.log(`✅ Gemini API Response:`, response.data);
            
            // Check if response has reply
            if (response.data && response.data.reply) {
                const replyText = `🤖 *KHAN:* ${response.data.reply}`;
                
                // Edit the thinking message with the response
                const protocolMsg = {
                    key: thinkingMsg.key,
                    type: 0xe,
                    editedMessage: { 
                        conversation: replyText 
                    }
                };
                await client.relayMessage(from, { protocolMessage: protocolMsg }, {});
            } else {
                // If no reply in response, edit with error
                const errorText = `🤖 *KHAN:* I couldn't process that. Please try again.`;
                const protocolMsg = {
                    key: thinkingMsg.key,
                    type: 0xe,
                    editedMessage: { 
                        conversation: errorText 
                    }
                };
                await client.relayMessage(from, { protocolMessage: protocolMsg }, {});
            }
            
        } catch (error) {
            console.error("Gemini API Error:", error.message);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
            
            // Handle API errors
            let errorMessage = `❌ *KHAN Error:* `;
            
            if (error.response) {
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
                errorMessage += `No response from Gemini service. Please check your internet connection.`;
            } else {
                errorMessage += `Failed to connect to Gemini service. Please try again.`;
            }
            
            // Send error message with quoted reply
            await client.sendMessage(from, { 
                text: errorMessage,
                quoted: message
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
