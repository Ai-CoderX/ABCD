// plugins/KHAN.js - ESM Version
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
        
        // If just "KHAN" with no command, show menu
        if (!cleanMsg) {
            const menuText = `🤖 *KHAN:* Ok boss! I'm ready!

📋 *Try these commands:*
• ${matchedText} menu - Show all commands
• ${matchedText} play <song> - Play music
• ${matchedText} ping - Check response
• ${matchedText} status - Bot status
• ${matchedText} gpt <query> - ChatGPT assistant

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
            // Send "Ok boss" message
            const okMsg = await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Ok boss! Processing "${commandPattern}"...` 
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
        
        // ===== FALLBACK TO GPT COMMAND =====
        // Find GPT command (not AI)
        const gptCommand = commands.find(c => 
            c.pattern === 'gpt' || c.pattern === 'chatgpt' || c.pattern === 'openai' ||
            (Array.isArray(c.pattern) && c.pattern.includes('gpt')) ||
            (Array.isArray(c.pattern) && c.pattern.includes('chatgpt')) ||
            (c.alias && (Array.isArray(c.alias) ? c.alias.includes('gpt') : c.alias === 'gpt'))
        );
        
        if (gptCommand) {
            // Send processing message
            await client.sendMessage(from, { 
                text: `🤖 *KHAN:* Let me think about that...` 
            });
            
            const context = {
                from,
                reply,
                sender,
                userConfig,
                isCreator: false,
                isGroup,
                args: [cleanMsg],
                q: cleanMsg,
                text: cleanMsg,
                isCmd: true,
                command: gptCommand.pattern || 'gpt'
            };
            
            await gptCommand.function(client, message, m, context);
        } else {
            // If no GPT command found, try AI as last resort
            const aiCommand = commands.find(c => 
                c.pattern === 'ai' || c.pattern === 'chat' ||
                (Array.isArray(c.pattern) && c.pattern.includes('ai'))
            );
            
            if (aiCommand) {
                const context = {
                    from,
                    reply,
                    sender,
                    userConfig,
                    isCreator: false,
                    isGroup,
                    args: [cleanMsg],
                    q: cleanMsg,
                    text: cleanMsg,
                    isCmd: true,
                    command: aiCommand.pattern || 'ai'
                };
                
                await aiCommand.function(client, message, m, context);
            } else {
                // Default response if no GPT or AI command found
                await reply(`🤖 *KHAN:* I didn't understand "${cleanMsg}"

📋 *Try these:*
• ${matchedText} menu
• ${matchedText} play <song>
• ${matchedText} ping
• ${matchedText} status
• ${matchedText} gpt <your question>

💡 *Just say "${matchedText}" to see all options*`);
            }
        }
        
    } catch (error) {
        console.error("KHAN Plugin Error:", error);
        try {
            await reply(`❌ KHAN Error: ${error.message}`);
        } catch (e) {}
    }
});
