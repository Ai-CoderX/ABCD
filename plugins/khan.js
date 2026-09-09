// plugins/khan.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd, commands } from '../command.js';
import config from '../config.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// Keyword that triggers KHAN (all case variations supported)
const KHANTriggers = ["khan"];

// Pollinations.ai API URL (WORKING)
const POLLINATIONS_API = 'https://text.pollinations.ai';

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
        // Keep original body for message sending, use lowercase for checking
        const originalBody = body.trim();
        const lowerBody = originalBody.toLowerCase();
        
        // Check if message starts with "KHAN" (case insensitive)
        let cleanMsg = null;
        let matchedTrigger = null;
        let matchedText = null;
        
        for (const trigger of KHANTriggers) {
            if (lowerBody.startsWith(trigger)) {
                matchedTrigger = trigger;
                const triggerRegex = new RegExp(`^${trigger}`, 'i');
                cleanMsg = originalBody.replace(triggerRegex, '').trim();
                matchedText = originalBody.match(new RegExp(`^${trigger}`, 'i'))[0];
                break;
            }
        }
        
        if (!matchedTrigger) {
            return;
        }
        
        const PREFIX = userConfig?.PREFIX || config.PREFIX || ".";
        
        // If just "KHAN" with no command, show intro
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
            
            try {
                await m.react('🤖');
            } catch (e) {}
            
            return;
        }

        // ===== SMART COMMAND DETECTION (Find command anywhere in text) =====
        const lowerCleanMsg = cleanMsg.toLowerCase();
        let foundCommand = null;
        let foundArgs = [];
        let commandPattern = null;
        let matchedCommandName = null;
        
        // FIRST PASS: Check for exact command names anywhere in the text
        const sortedCommands = [...commands].sort((a, b) => {
            const aPatterns = Array.isArray(a.pattern) ? a.pattern : [a.pattern];
            const bPatterns = Array.isArray(b.pattern) ? b.pattern : [b.pattern];
            const aLen = Math.max(...aPatterns.map(p => p.length));
            const bLen = Math.max(...bPatterns.map(p => p.length));
            return bLen - aLen;
        });
        
        for (const cmd of sortedCommands) {
            const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
            const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
            const allNames = [...patterns, ...aliases].filter(Boolean);
            
            for (const name of allNames) {
                const nameLower = name.toLowerCase();
                if (nameLower.length < 2) continue;
                
                // Check if the command name appears as a whole word in the text
                const regex = new RegExp(`\\b${nameLower}\\b`, 'i');
                if (regex.test(lowerCleanMsg)) {
                    foundCommand = cmd;
                    commandPattern = name;
                    matchedCommandName = nameLower;
                    
                    // Extract everything AFTER the command name as arguments
                    const parts = cleanMsg.split(new RegExp(name, 'i'));
                    if (parts.length > 1) {
                        const afterCommand = parts.slice(1).join(' ').trim();
                        foundArgs = afterCommand ? afterCommand.split(/\s+/) : [];
                    } else {
                        foundArgs = [];
                    }
                    break;
                }
            }
            if (foundCommand) break;
        }
        
        // SECOND PASS: If no command found, check if first word matches (fallback)
        if (!foundCommand) {
            const words = cleanMsg.toLowerCase().split(/\s+/);
            for (const cmd of commands) {
                const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
                const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
                const allNames = [...patterns, ...aliases].filter(Boolean);
                
                for (const name of allNames) {
                    const nameLower = name.toLowerCase();
                    if (nameLower.length < 2) continue;
                    if (words[0] === nameLower) {
                        foundCommand = cmd;
                        commandPattern = name;
                        matchedCommandName = nameLower;
                        foundArgs = words.slice(1);
                        break;
                    }
                }
                if (foundCommand) break;
            }
        }
        
        // THIRD PASS: Check for partial matches (like "playing" contains "play")
        if (!foundCommand) {
            for (const cmd of sortedCommands) {
                const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
                const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
                const allNames = [...patterns, ...aliases].filter(Boolean);
                
                for (const name of allNames) {
                    const nameLower = name.toLowerCase();
                    if (nameLower.length < 2) continue;
                    
                    if (lowerCleanMsg.includes(nameLower) && 
                        lowerCleanMsg.split(/\s+/).some(w => w.startsWith(nameLower))) {
                        foundCommand = cmd;
                        commandPattern = name;
                        matchedCommandName = nameLower;
                        
                        const parts = cleanMsg.split(new RegExp(name, 'i'));
                        if (parts.length > 1) {
                            const afterCommand = parts.slice(1).join(' ').trim();
                            foundArgs = afterCommand ? afterCommand.split(/\s+/) : [];
                        } else {
                            foundArgs = [];
                        }
                        break;
                    }
                }
                if (foundCommand) break;
            }
        }
        
        // If command found, execute it
        if (foundCommand && commandPattern) {
            const okMsg = await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Ok boss! Processing "${commandPattern}"...`,
                quoted: message
            });
            
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
            
            try {
                await foundCommand.function(client, message, m, context);
            } catch (err) {
                await reply(`❌ Error executing command: ${err.message}`);
            }
            
            return;
        }
        
        // ===== FALLBACK TO POLLINATIONS.AI API =====
        try {
            const thinkingMsg = await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Let me think about that...`,
                quoted: message
            });
            
            try {
                await client.sendMessage(from, {
                    react: {
                        text: '🧠',
                        key: thinkingMsg.key
                    }
                });
            } catch (e) {}
            
            const encodedPrompt = encodeURIComponent(cleanMsg);
            const apiUrl = `${POLLINATIONS_API}/${encodedPrompt}?json=true`;
            
            console.log(`📡 Calling Pollinations API: ${apiUrl}`);
            
            const response = await axios.get(apiUrl, {
                timeout: 30000
            });
            
            console.log(`✅ Pollinations API Response:`, response.data);
            
            let replyText = null;
            
            if (response.data) {
                if (response.data.content) {
                    replyText = response.data.content;
                } else if (response.data.response) {
                    replyText = response.data.response;
                } else if (response.data.reply) {
                    replyText = response.data.reply;
                } else if (typeof response.data === 'string') {
                    replyText = response.data;
                } else if (response.data.choices && response.data.choices[0]?.message?.content) {
                    replyText = response.data.choices[0].message.content;
                }
            }
            
            if (replyText && replyText.length > 3) {
                const finalText = `🤖 *KHAN:* ${replyText}`;
                
                const protocolMsg = {
                    key: thinkingMsg.key,
                    type: 0xe,
                    editedMessage: { 
                        conversation: finalText
                    }
                };
                await client.relayMessage(from, { protocolMessage: protocolMsg }, {});
            } else {
                const helpText = `🤖 *KHAN:* I didn't understand "${cleanMsg}"

📋 *Try these:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status
• ${matchedText} <question> - Ask me anything!`;

                const protocolMsg = {
                    key: thinkingMsg.key,
                    type: 0xe,
                    editedMessage: { 
                        conversation: helpText
                    }
                };
                await client.relayMessage(from, { protocolMessage: protocolMsg }, {});
            }
            
        } catch (error) {
            console.error("Pollinations API Error:", error.message);
            
            const helpText = `🤖 *KHAN:* I'm having trouble connecting. Try these commands instead:

• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status

💡 *Just say "${matchedText}" to see all options*`;

            await client.sendMessage(from, { 
                text: helpText,
                quoted: message
            });
        }
        
    } catch (error) {
        console.error("KHAN Plugin Error:", error);
        try {
            await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Sorry, I'm having trouble right now. Try again in a moment!`,
                quoted: message
            });
        } catch (e) {}
    }
});
