import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// ============================================
// HIDDEN API - ENCODED IN BASE64
// ============================================
const ENCODED_API = "aHR0cHM6Ly9lcmZhbi1tZC52ZXJjZWwuYXBw"; // https://erfan-md.vercel.app

function decodeApi() {
    return Buffer.from(ENCODED_API, 'base64').toString('utf-8');
}

// ============================================
// COMMAND: Extract Heroku URLs (API Hidden)
// ============================================
cmd({
    pattern: "heroku",
    alias: ["getheroku", "herokuurls", "extractheroku"],  
    desc: "Extract Heroku server URLs",
    react: "⚡",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, reply, sender
}) => {
    try {
        await reply("⚡ *Extracting Heroku URLs...*");

        const targetSite = decodeApi();
        const herokuUrls = [];

        // Method 1: Scan all servers via /x endpoint
        for (let i = 1; i <= 100; i++) {
            const serverId = `server${i}`;
            
            try {
                const response = await axios.post(`${targetSite}/x`, {
                    a: 'status',
                    b: serverId
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Origin': targetSite,
                        'Referer': targetSite + '/'
                    },
                    timeout: 8000
                });

                // Check response for Heroku URLs
                const responseStr = JSON.stringify(response.data);
                const herokuMatch = responseStr.match(/https?:\/\/[a-zA-Z0-9\-]+\.herokuapp\.com/g);
                if (herokuMatch) {
                    herokuUrls.push({
                        server: serverId,
                        url: herokuMatch[0]
                    });
                }

                // Check headers for Heroku URLs
                if (response.headers) {
                    const headersStr = JSON.stringify(response.headers);
                    const headerMatch = headersStr.match(/https?:\/\/[a-zA-Z0-9\-]+\.herokuapp\.com/g);
                    if (headerMatch) {
                        herokuUrls.push({
                            server: serverId,
                            url: headerMatch[0],
                            source: 'headers'
                        });
                    }
                }

            } catch (error) {
                // Check error for Heroku URLs
                if (error.response) {
                    const errorStr = JSON.stringify(error.response.data || '');
                    const herokuMatch = errorStr.match(/https?:\/\/[a-zA-Z0-9\-]+\.herokuapp\.com/g);
                    if (herokuMatch) {
                        herokuUrls.push({
                            server: serverId,
                            url: herokuMatch[0],
                            source: 'error'
                        });
                    }
                }
                continue;
            }

            // Progress update
            if (i % 20 === 0) {
                await reply(`⏳ Scanning... ${i}/100 | Found ${herokuUrls.length} Heroku URLs`);
            }
        }

        // Method 2: Try /gen endpoint
        if (herokuUrls.length === 0) {
            await reply("🔄 *Trying alternative method...*");
            
            for (let i = 1; i <= 100; i++) {
                const serverId = `server${i}`;
                
                try {
                    const response = await axios.post(`${targetSite}/x`, {
                        a: 'gen',
                        b: {
                            server: serverId,
                            number: '923000000000'
                        }
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Origin': targetSite,
                            'Referer': targetSite + '/'
                        },
                        timeout: 8000
                    });

                    const responseStr = JSON.stringify(response.data);
                    const herokuMatch = responseStr.match(/https?:\/\/[a-zA-Z0-9\-]+\.herokuapp\.com/g);
                    if (herokuMatch) {
                        herokuUrls.push({
                            server: serverId,
                            url: herokuMatch[0],
                            source: 'gen_error'
                        });
                    }

                } catch (error) {
                    if (error.response) {
                        const errorStr = JSON.stringify(error.response.data || '');
                        const herokuMatch = errorStr.match(/https?:\/\/[a-zA-Z0-9\-]+\.herokuapp\.com/g);
                        if (herokuMatch) {
                            herokuUrls.push({
                                server: serverId,
                                url: herokuMatch[0],
                                source: 'gen_error'
                            });
                        }
                    }
                    continue;
                }
            }
        }

        // Remove duplicates
        const uniqueUrls = [];
        const seenUrls = new Set();
        
        for (const item of herokuUrls) {
            if (!seenUrls.has(item.url)) {
                seenUrls.add(item.url);
                uniqueUrls.push(item);
            }
        }

        // Build response
        let message = "⚡ *HEROKU SERVER URLs*\n\n";
        message += `📊 Found: ${uniqueUrls.length} Heroku URLs\n\n`;
        message += `━━━━━━━━━━━━━━━━━━━\n\n`;

        if (uniqueUrls.length === 0) {
            message += "❌ *No Heroku URLs found*\n\n";
            message += "💡 Try:\n";
            message += "• .checkjs - Check JavaScript files\n";
            message += "• .viewsource - Check HTML source\n";
            message += "• .brute - Try brute force patterns";
        } else {
            uniqueUrls.forEach((item, i) => {
                message += `${i+1}. *${item.server || 'Unknown'}*\n`;
                message += `   🔗 \`${item.url}\`\n`;
                if (item.source) {
                    message += `   📍 Found in: ${item.source}\n`;
                }
                message += `\n`;
            });

            message += `━━━━━━━━━━━━━━━━━━━\n`;
            message += `✅ *Total Unique URLs:* ${uniqueUrls.length}\n\n`;
            message += `💡 Use: .gencode server1 923xxxxxxxx to test`;
        }

        await reply(message);

    } catch (error) {
        console.error("Heroku Extract Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// COMMAND: Generate code (API Hidden)
// ============================================
cmd({
    pattern: "gencode",
    alias: ["gen", "pair", "generate"],  
    desc: "Generate pair code from server",
    react: "🔑",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, reply, text
}) => {
    try {
        if (!text) {
            return reply("⚠️ *Usage:* .gencode server1 923xxxxxxxx\nExample: .gencode server1 92342758xxxxx");
        }

        const parts = text.trim().split(' ');
        if (parts.length < 2) {
            return reply("⚠️ *Usage:* .gencode server1 923xxxxxxxx\nExample: .gencode server1 92342758xxxxx");
        }

        const serverId = parts[0];
        const number = parts[1];

        if (!number || number.length < 10) {
            return reply("⚠️ *Invalid number!* Must be 10-15 digits.");
        }

        const targetSite = decodeApi();
        
        await reply(`🔑 *Generating code...*\nServer: ${serverId}\nNumber: ${number}\n\n⏳ Please wait...`);

        // Check server status
        const statusCheck = await axios.post(`${targetSite}/x`, {
            a: 'status',
            b: serverId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': targetSite,
                'Referer': targetSite + '/'
            },
            timeout: 10000
        });

        if (statusCheck.data && statusCheck.data.error) {
            return reply(`❌ *Server ${serverId} is OFFLINE!*\nError: ${statusCheck.data.error}`);
        }

        if (statusCheck.data && statusCheck.data.count >= statusCheck.data.limit) {
            return reply(`❌ *Server ${serverId} is FULL!*\nActive: ${statusCheck.data.count}/${statusCheck.data.limit}`);
        }

        // Generate code
        const response = await axios.post(`${targetSite}/x`, {
            a: 'gen',
            b: {
                server: serverId,
                number: number
            }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': targetSite,
                'Referer': targetSite + '/'
            },
            timeout: 15000
        });

        let message = `🔑 *PAIR CODE GENERATED*\n\n`;
        message += `🆔 Server: ${serverId}\n`;
        message += `📱 Number: ${number}\n\n`;

        if (response.data && response.data.c) {
            message += `✅ *Code:* \`${response.data.c}\`\n\n`;
            message += `📋 Copy this code and paste in WhatsApp\n`;
            message += `⏳ Code expires in 5 minutes`;
        } else if (response.data && response.data.e) {
            message += `❌ *Error:* ${response.data.e}`;
        } else {
            message += `❌ *Failed to generate code.* No response from server.`;
        }

        await reply(message);

    } catch (error) {
        console.error("Gen Error:", error);
        await reply(`❌ Error: ${error.message}`);
    }
});

// ============================================
// COMMAND: Check server status (API Hidden)
// ============================================
cmd({
    pattern: "serverinfo",
    alias: ["sinfo", "server", "check"],  
    desc: "Get detailed info for a specific server",
    react: "📊",
    category: "utility",
    filename: __filename,
}, async (conn, mek, m, { 
    from, reply, text
}) => {
    try {
        if (!text) {
            return reply("⚠️ *Usage:* .serverinfo server1\nExample: .serverinfo server1");
        }

        const targetSite = decodeApi();
        const serverId = text.trim();
        
        const response = await axios.post(`${targetSite}/x`, {
            a: 'status',
            b: serverId
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': targetSite,
                'Referer': targetSite + '/'
            },
            timeout: 10000
        });

        let message = `📊 *SERVER DETAILS*\n\n`;
        message += `🆔 Server: ${serverId}\n\n`;

        if (response.data && !response.data.error) {
            message += `✅ *Status:* ONLINE\n`;
            message += `👥 *Active Users:* ${response.data.count || 0}\n`;
            message += `📈 *User Limit:* ${response.data.limit || 50}\n`;
            message += `📊 *Availability:* ${Math.round(((response.data.limit - response.data.count) / response.data.limit) * 100)}%\n\n`;
            
            if (response.data.count >= response.data.limit) {
                message += `⚠️ *Server is FULL!* Cannot generate new codes.\n`;
            } else {
                message += `✅ *Server has capacity for ${response.data.limit - response.data.count} more users.*\n`;
            }
        } else {
            message += `❌ *Status:* OFFLINE or NOT FOUND\n`;
            if (response.data && response.data.error) {
                message += `📝 *Error:* ${response.data.error}\n`;
            }
        }

        message += `\n━━━━━━━━━━━━━━━━━━━\n`;
        message += `💡 *Commands:*\n`;
        message += `• .heroku - Find all servers\n`;
        message += `• .gencode server1 923xxxxxxxx - Generate code`;

        await reply(message);

    } catch (error) {
        await reply(`❌ Server ${text} is OFFLINE or doesn't exist`);
    }
});

// ============================================
// COMMAND: Decode API (Hidden - Only for testing)
// ============================================
cmd({
    pattern: "decodeapi",
    alias: ["showapi"],  
    desc: "Show decoded API URL (hidden)",
    react: "🔓",
    category: "owner",
    filename: __filename,
}, async (conn, mek, m, { 
    from, reply, isOwner
}) => {
    // Only bot owner can see this
    if (!isOwner) {
        return reply("❌ Access denied.");
    }
    
    const decoded = decodeApi();
    await reply(`🔓 *Decoded API URL:*\n\`${decoded}\``);
});
