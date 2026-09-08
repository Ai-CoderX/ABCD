// plugins/jarvis.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd, commands } from '../command.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

// Keywords that trigger Jarvis (all case variations supported)
const jarvisTriggers = ["jarvis", "jawad"];

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
        // Only allow the bot owner/creator
        if (!isCreator) {
            return;
        }

        // Keep original body for message sending, use lowercase for checking
        const originalBody = body.trim();
        const lowerBody = originalBody.toLowerCase();
        
        // Check if message starts with any Jarvis trigger (case insensitive)
        let cleanMsg = null;
        let matchedTrigger = null;
        let matchedText = null;
        
        for (const trigger of jarvisTriggers) {
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
        
        // If no Jarvis trigger found at start, return
        if (!matchedTrigger) {
            return;
        }
        
        // Get PREFIX
        const PREFIX = userConfig?.PREFIX || config.PREFIX || ".";
        
        // If just "jarvis" with no command, show menu
        if (!cleanMsg) {
            const menuText = `🤖 *Jarvis:* Ok boss! I'm ready!

📋 *Try these commands:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status
• ${matchedText} ai <query> - AI chat

💡 *Or just talk to me naturally!*`;

            await client.sendMessage(from, { text: menuText });
            
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
            
            // Check if any name matches the first word (case insensitive)
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
        
        // If no command found by first word, check if any command name appears in the message
        if (!foundCommand) {
            for (const cmd of commands) {
                const patterns = Array.isArray(cmd.pattern) ? cmd.pattern : [cmd.pattern];
                const aliases = Array.isArray(cmd.alias) ? cmd.alias : (cmd.alias ? [cmd.alias] : []);
                const allNames = [...patterns, ...aliases].filter(Boolean);
                
                for (const name of allNames) {
                    if (cleanMsg.toLowerCase().includes(name.toLowerCase())) {
                        foundCommand = cmd;
                        commandPattern = name;
                        // Extract everything after the command name
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
            // Send "Ok boss" message
            const okMsg = await client.sendMessage(from, { 
                text: `🤖 *Jarvis:* Ok boss! Processing "${commandPattern}"...` 
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
                isCreator,
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
        
        // If no command found, try to use AI/chat command
        const chatCommand = commands.find(c => 
            c.pattern === 'ai' || c.pattern === 'chat' || c.pattern === 'gpt' ||
            (Array.isArray(c.pattern) && c.pattern.includes('ai')) ||
            (Array.isArray(c.pattern) && c.pattern.includes('chat'))
        );
        
        if (chatCommand) {
            // Send processing message
            await client.sendMessage(from, { 
                text: `🤖 *Jarvis:* Let me think about that...` 
            });
            
            const context = {
                from,
                reply,
                sender,
                userConfig,
                isCreator,
                isGroup,
                args: [cleanMsg],
                q: cleanMsg,
                text: cleanMsg,
                isCmd: true,
                command: chatCommand.pattern
            };
            
            await chatCommand.function(client, message, m, context);
        } else {
            // Default response if no AI command found
            await reply(`🤖 *Jarvis:* I didn't understand "${cleanMsg}"

📋 *Try these:*
• ${matchedText} menu
• ${matchedText} play <song>
• ${matchedText} ping
• ${matchedText} status
• ${matchedText} ai <your question>

💡 *Just say "${matchedText}" to see all options*`);
        }
        
    } catch (error) {
        console.error("Jarvis Plugin Error:", error);
        try {
            await reply(`❌ Jarvis Error: ${error.message}`);
        } catch (e) {}
    }
});
