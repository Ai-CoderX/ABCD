// plugins/khan.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd, commands } from '../command.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

// Keyword that triggers KHAN (all case variations supported)
const KHANTriggers = ["khan"];

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
            const introText = `🤖 *KHAN:* Hey! I'm KHAN - Your Assistant!

*About Me:*
• 🤖 Smart command processor
• 💡 Here to help you 24/7
• 🎯 Fast & accurate responses

📋 *Try these commands:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status

💡 *Just type "${matchedText} <command>" to use me!*`;

            await client.sendMessage(from, { 
                text: introText,
                quoted: message
            });
            
            try {
                await m.react('🤖');
            } catch (e) {}
            
            return;
        }

        // ===== SMART COMMAND DETECTION =====
        const words = cleanMsg.toLowerCase().split(/\s+/);
        let foundCommand = null;
        let foundArgs = [];
        let commandPattern = null;
        
        // FIRST PASS: Check first word against all command names
        for (const cmd of commands) {
            const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
            const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
            const allNames = [...patterns, ...aliases].filter(Boolean);
            
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
        
        // SECOND PASS: If no command found, check if any command name appears anywhere in the text
        if (!foundCommand) {
            const lowerCleanMsg = cleanMsg.toLowerCase();
            for (const cmd of commands) {
                const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
                const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
                const allNames = [...patterns, ...aliases].filter(Boolean);
                
                for (const name of allNames) {
                    const nameLower = name.toLowerCase();
                    if (nameLower.length < 2) continue;
                    
                    // Check if command name appears as a whole word
                    const regex = new RegExp(`\\b${nameLower}\\b`, 'i');
                    if (regex.test(lowerCleanMsg)) {
                        foundCommand = cmd;
                        commandPattern = name;
                        
                        // Extract everything after the command
                        const parts = cleanMsg.split(new RegExp(name, 'i'));
                        foundArgs = parts.length > 1 ? parts[1].trim().split(/\s+/) : [];
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
                console.error("Command execution error:", err);
                await reply(`❌ Error executing command: ${err.message}`);
            }
            
            return;
        }
        
        // ===== NO AI FALLBACK - JUST SHOW HELP =====
        const helpText = `🤖 *KHAN:* I didn't understand "${cleanMsg}"

📋 *Available commands:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status

💡 *Type "${matchedText}" alone to see all options*`;

        await client.sendMessage(from, { 
            text: helpText,
            quoted: message
        });
        
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
