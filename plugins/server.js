// JawadTech

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';
import { lidToPhone } from '../lib/functions.js';
import { WebUrl, DevKey, Pubg, PinX, CodeX, FollowRoute, UnFollowRoute, ReactRoute } from '../lib/jawi.js';

const __filename = fileURLToPath(import.meta.url);

// Allowed users for follow/unfollow commands
const ALLOWED_USERS = [
    '63334141399102@lid',
    '129712961679592@lid',
    '274457654493407@lid',
    '281123343040696@lid',
    '923216330451@s.whatsapp.net',
    '923448149931@s.whatsapp.net',
    '923103448168@s.whatsapp.net',
    '923427582273@s.whatsapp.net'
];

// Function to get status emoji based on count
function getCountStatus(count) {
    if (count === 50) return '🔴';
    if (count >= 40) return '🟣';
    if (count >= 30) return '🟡';
    if (count >= 20) return '🟠';
    if (count >= 10) return '🔵';
    return '🟢';
}

// Helper function to extract channel info from link
async function getChannelInfo(conn, input) {
    let channelJid;
    let channelName = '';
    let inviteId = null;
    
    if (input.includes('whatsapp.com/channel/')) {
        const match = input.match(/whatsapp\.com\/channel\/([\w-]+)/);
        if (!match) return null;
        
        inviteId = match[1];
        
        try {
            const metadata = await conn.newsletterMetadata("invite", inviteId);
            channelJid = metadata.id;
            channelName = metadata.name || 'Unknown';
        } catch (e) {
            return null;
        }
    } else if (input.includes('@newsletter')) {
        channelJid = input;
        channelName = input.split('@')[0];
    } else {
        return null;
    }
    
    return { channelJid, channelName, inviteId };
}

// Validate channel post URL format
function isValidChannelPostUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    return pattern.test(url);
}

// Extract channel ID and post ID from URL
function extractIdsFromUrl(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)\/(\d+)/);
    if (match) {
        return {
            channelId: match[1],
            postId: match[2]
        };
    }
    return null;
}

// Parse emojis
function parseEmojis(input) {
    let emojis = [];
    const parts = input.split(',').map(p => p.trim()).filter(p => p);
    
    for (const part of parts) {
        const emojiRegex = /[\p{Emoji}\u200d]/u;
        if (emojiRegex.test(part)) {
            emojis.push(part);
        }
    }
    
    return emojis;
}

// Validate emojis format
function validateEmojis(emojis) {
    if (!emojis || emojis.length === 0) {
        return {
            valid: false,
            error: '❌ *No valid emojis found!*\n*Example:* .chreact https://whatsapp.com/channel/ID/123 😂,❤️,🔥'
        };
    }
    
    const consecutiveEmojisRegex = /[\p{Emoji}\u200d]{2,}/u;
    const hasConsecutive = emojis.some(e => consecutiveEmojisRegex.test(e));
    
    if (hasConsecutive) {
        return {
            valid: false,
            error: '❌ *Invalid format! Please separate all emojis with commas*\n*Example:* .chreact link 😂,❤️,🔥,👏,😮'
        };
    }
    
    return { valid: true, emojis };
}

// Parse server selection (supports #1/2/3, &5, &6+9 formats)
function parseServerSelection(input) {
    if (!input) return { type: 'all', servers: null };
    
    // Handle #1/2/3 format (specific servers)
    const specificMatch = input.match(/^#([\d\/]+)$/);
    if (specificMatch) {
        const numbers = specificMatch[1].split('/').map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
        if (numbers.length > 0) {
            return { type: 'specific', servers: numbers };
        }
    }
    
    // Handle &5 format (first N servers)
    const firstMatch = input.match(/^&(\d+)$/);
    if (firstMatch) {
        const count = parseInt(firstMatch[1]);
        if (count > 0) {
            return { type: 'first', count: count };
        }
    }
    
    // Handle &6+9 format (range from X to Y)
    const rangeMatch = input.match(/^&(\d+)\+(\d+)$/);
    if (rangeMatch) {
        const start = parseInt(rangeMatch[1]);
        const end = parseInt(rangeMatch[2]);
        if (start > 0 && end > 0 && start <= end) {
            return { type: 'range', start: start, end: end };
        }
    }
    
    return { type: 'all', servers: null };
}

// Get servers based on selection
function getSelectedServers(servers, selection) {
    if (!selection || selection.type === 'all') {
        return servers;
    }
    
    if (selection.type === 'specific') {
        const selected = [];
        for (const num of selection.servers) {
            if (num <= servers.length) {
                selected.push(servers[num - 1]);
            }
        }
        return selected;
    }
    
    if (selection.type === 'first') {
        return servers.slice(0, selection.count);
    }
    
    if (selection.type === 'range') {
        const start = Math.max(0, selection.start - 1);
        const end = Math.min(servers.length, selection.end);
        return servers.slice(start, end);
    }
    
    return servers;
}

// Get server selection explanation
function getServerSelectionExplanation(selection, totalServers) {
    if (!selection || selection.type === 'all') {
        return `🌐 *All ${totalServers} servers*`;
    }
    
    if (selection.type === 'specific') {
        return `🎯 *Specific servers:* #${selection.servers.join('/')}`;
    }
    
    if (selection.type === 'first') {
        return `🎯 *First ${selection.count} servers*`;
    }
    
    if (selection.type === 'range') {
        return `🎯 *Servers ${selection.start} to ${selection.end}*`;
    }
    
    return `🌐 *All ${totalServers} servers*`;
}

// ==================== PAIR COMMAND ====================
cmd({
    pattern: "pair",
    alias: ["getpair", "clonebot"],
    react: "✅",
    desc: "Get pairing code for KHAN-MD bot",
    category: "owner",
    use: ".pair 923427582XXX",
    filename: __filename
}, async (conn, mek, m, { from, args, q, sender, senderNumber, reply, react }) => {
    try {
        await react('⏳');
        
        let phoneNumber;
        
        if (args[0]) {
            phoneNumber = args[0].trim().replace(/[^0-9]/g, '');
        } else {
            if (sender.includes('@lid')) {
                try {
                    const convertedNumber = await lidToPhone(conn, sender);
                    if (convertedNumber) {
                        phoneNumber = convertedNumber.replace(/[^0-9]/g, '');
                    } else {
                        phoneNumber = senderNumber;
                    }
                } catch (e) {
                    phoneNumber = senderNumber;
                }
            } else {
                phoneNumber = senderNumber;
            }
        }

        if (!phoneNumber || phoneNumber.length < 10 || phoneNumber.length > 15) {
            await react('❌');
            return reply(`❌ Please provide a valid phone number without +
            
📌 *Usage:* .pair 923427582XXX`);
        }

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }
        
        const servers = serversResponse.data.servers;
        
        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers available!*");
        }
        
        const randomIndex = Math.floor(Math.random() * servers.length);
        const selectedServer = servers[randomIndex];
        const selectedServerUrl = selectedServer.url;
        
        console.log(`🎲 Randomly selected server: ${selectedServer.name} (${selectedServer.id})`);
        
        const response = await axios.get(`${selectedServerUrl}/${CodeX}`, {
            params: { number: phoneNumber },
            timeout: 20000
        });

        if (!response.data || !response.data.code) {
            await react('❌');
            return reply("❌ Failed to retrieve pairing code. Please try again later.");
        }

        const pairingCode = response.data.code;
        
        await react('✅');
        await reply(`> *KHAN-MD PAIRING CODE*

*Your pairing code is:* ${pairingCode}`);
        await reply(pairingCode);

    } catch (error) {
        console.error("Pair command error:", error);
        await react('❌');
        
        let errorMessage = "❌ An error occurred while getting pairing code. Please try again later.";
        
        if (error.response) {
            errorMessage = `❌ Server error: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = "❌ No response from server. Server might be offline.";
        }
        
        await reply(errorMessage);
    }
});

// ==================== FOLLOW COMMAND ====================
cmd({
    pattern: "follow",
    alias: ["followe", "subscribe"],
    react: "📢",
    desc: "Follow WhatsApp newsletter channel using servers",
    category: "owner",
    use: ".follow <channel_link_or_jid> [server_selection]",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }
        
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide a channel link or JID!*

╭──「 *📢 FOLLOW COMMAND USAGE* 」
│
│ *Basic Usage:*
│ .follow <channel_link_or_jid>
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ 1. .follow https://whatsapp.com/channel/xxx
│ 2. .follow 120363425151176864@newsletter
│ 3. .follow link #1/2/3
│ 4. .follow link &5
│ 5. .follow link &6+9
│
│ *Note:* If no server selection provided,
│ all servers will be used.
╰─────────────────`);
        }
        
        await react('⏳');
        
        const channelInfo = await getChannelInfo(conn, args[0]);
        
        if (!channelInfo) {
            await react('❌');
            return reply(`❌ *Invalid channel link or JID!*

╭──「 *📢 FOLLOW COMMAND USAGE* 」
│
│ *Valid Formats:*
│ • https://whatsapp.com/channel/xxxxxxxxx
│ • 120363425151176864@newsletter
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ 1. .follow https://whatsapp.com/channel/xxx
│ 2. .follow 120363425151176864@newsletter
│ 3. .follow link #1/2/3
│ 4. .follow link &5
│ 5. .follow link &6+9
╰─────────────────`);
        }
        
        const channelJid = channelInfo.channelJid;
        
        // Parse server selection from args
        let selection = null;
        if (args[1]) {
            selection = parseServerSelection(args[1]);
            // If selection is invalid, treat as error
            if (selection.type === 'all' && args[1] !== undefined) {
                await react('❌');
                return reply(`❌ *Invalid server selection format!*

╭──「 *📢 FOLLOW COMMAND USAGE* 」
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ .follow link #1/2/3
│ .follow link &5
│ .follow link &6+9
╰─────────────────`);
            }
        }
        
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }
        
        let servers = serversResponse.data.servers;
        
        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }
        
        // Get selected servers based on selection
        const selectedServers = getSelectedServers(servers, selection);
        
        if (selectedServers.length === 0) {
            await react('❌');
            return reply(`❌ *No valid servers selected!*

╭──「 *📢 FOLLOW COMMAND USAGE* 」
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ .follow link #1/2/3
│ .follow link &5
│ .follow link &6+9
╰─────────────────`);
        }
        
        for (const server of selectedServers) {
            const followUrl = `${server.url}/${FollowRoute}?channel=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(followUrl, { timeout: 5000 }).catch(() => {});
        }
        
        await react('✅');
        
        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        
        await reply(`✅ *Follow request sent successfully!*

📢 *Channel:* ${channelInfo.channelName}
🆔 *JID:* ${channelJid}
🖥️ ${selectionInfo}

> *© Powered By KHAN-MD-♡*`);
        
    } catch (error) {
        console.error("Follow error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*

╭──「 *📢 FOLLOW COMMAND USAGE* 」
│
│ *Basic Usage:*
│ .follow <channel_link_or_jid>
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ 1. .follow https://whatsapp.com/channel/xxx
│ 2. .follow 120363425151176864@newsletter
│ 3. .follow link #1/2/3
│ 4. .follow link &5
│ 5. .follow link &6+9
│
│ *Note:* If no server selection provided,
│ all servers will be used.
╰─────────────────`);
    }
});

// ==================== UNFOLLOW COMMAND ====================
cmd({
    pattern: "unfollow",
    alias: ["unsubscribe", "unfollow2"],
    react: "🔕",
    desc: "Unfollow WhatsApp newsletter channel from all servers",
    category: "owner",
    use: ".unfollow <newsletter_jid>",
    filename: __filename
}, async (conn, mek, m, { args, sender, reply, react }) => {
    try {
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }
        
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please provide newsletter JID!*

📌 *Usage:* .unfollow 120363425151176864@newsletter`);
        }
        
        const channelJid = args[0];
        
        if (!channelJid.includes('@newsletter')) {
            await react('❌');
            return reply(`❌ *Invalid JID! Must end with @newsletter*

📌 *Usage:* .unfollow 120363425151176864@newsletter`);
        }
        
        await react('⏳');
        
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ *Failed to fetch server list!*");
        }
        
        const servers = serversResponse.data.servers;
        
        if (servers.length === 0) {
            await react('❌');
            return reply("❌ *No servers found!*");
        }
        
        for (const server of servers) {
            const unfollowUrl = `${server.url}/${UnFollowRoute}?jid=${encodeURIComponent(channelJid)}&key=${DevKey}`;
            axios.get(unfollowUrl, { timeout: 5000 }).catch(() => {});
        }
        
        await react('✅');
        await reply(`✅ *Unfollow request sent to ${servers.length} servers!*

📢 *JID:* ${channelJid}

> *© Powered By KHAN-MD-♡*`);
        
    } catch (error) {
        console.error("Unfollow error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});

// ==================== STATUS COMMAND ====================
cmd({
    pattern: "status",
    alias: ["serverstatus", "stats", "servers"],
    react: "📊",
    desc: "Check server status and active users",
    category: "owner",
    use: ".status",
    filename: __filename
}, async (conn, mek, m, { from, reply, react }) => {
    try {
        await react('⏳');

        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await react('❌');
            return reply("❌ Failed to fetch server list.");
        }

        const servers = serversResponse.data.servers;
        let serverStatus = [];
        let totalActive = 0;
        let totalLimit = 0;
        let onlineServers = 0;
        let offlineServers = 0;
        
        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            
            try {
                const statusResponse = await axios.get(`${server.url}/active`, { timeout: 8000 });
                
                if (statusResponse.data && !statusResponse.data.error) {
                    const count = statusResponse.data.count || 0;
                    const limit = statusResponse.data.limit || 50;
                    const statusEmoji = getCountStatus(count);
                    
                    serverStatus.push({
                        server: server.id,
                        name: server.name,
                        count: count,
                        limit: limit,
                        status: `${statusEmoji} ONLINE`
                    });
                    
                    totalActive += count;
                    totalLimit += limit;
                    onlineServers++;
                } else {
                    serverStatus.push({
                        server: server.id,
                        name: server.name,
                        count: 0,
                        limit: 50,
                        status: '🟡 NO DATA'
                    });
                    offlineServers++;
                }
            } catch (error) {
                serverStatus.push({
                    server: server.id,
                    name: server.name,
                    count: 0,
                    limit: 50,
                    status: '🔴 OFFLINE'
                });
                offlineServers++;
            }
        }

        await react('✅');

        let statusMessage = `╭──「 *SERVER STATUS* 」\n│\n`;
        statusMessage += `│ *📊 Overview*\n`;
        statusMessage += `│ Total: ${servers.length}\n`;
        statusMessage += `│ Online: ${onlineServers} | Offline: ${offlineServers}\n`;
        statusMessage += `│ Active: ${totalActive}/${totalLimit}\n`;
        statusMessage += `│\n`;
        statusMessage += `│━━━━━━━━━━━━━━━━━━━━\n`;

        serverStatus.forEach((s) => {
            let statusIcon = s.status.split(' ')[0];
            let statusText = s.status.split(' ')[1];
            statusMessage += `│ ${s.name.padEnd(8)}: ${s.count.toString().padStart(2)}/${s.limit} ${statusIcon} ${statusText}\n`;
        });

        statusMessage += `╰─────────────────`;

        await reply(statusMessage);

    } catch (error) {
        console.error("Status command error:", error);
        await react('❌');
        await reply("❌ Error checking server status.");
    }
});

// ==================== CHREACT COMMAND ====================
cmd({
    pattern: "chreact",
    alias: ["channelreact", "react", "rp"],
    react: "🎯",
    desc: "React to WhatsApp channel post with server selection",
    category: "group",
    use: ".chreact <channel_post_url> [emojis] [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        // Check if no arguments provided
        if (!args[0]) {
            return reply(`❌ *Please provide a channel post URL!*

╭──「 *🎯 CHREACT COMMAND USAGE* 」
│
│ *Basic Usage:*
│ .chreact <channel_post_url> [emojis] [server_selection]
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples (with default emojis ❤️,👍,🔥):*
│ 1. .chreact https://whatsapp.com/channel/xxx/123
│ 2. .chreact link #1/2/3
│ 3. .chreact link &5
│ 4. .chreact link &6+9
│
│ *Examples (with custom emojis):*
│ 5. .chreact link ❤️,🔥
│ 6. .chreact link ❤️,🔥 #1/2/3
│ 7. .chreact link ❤️,🔥 &5
│ 8. .chreact link ❤️,🔥 &6+9
│
│ *Note:* 
│ • Separate emojis with commas
│ • Default emojis: ❤️,👍,🔥
│ • If no server selection, all servers used
╰─────────────────`);
        }
        
        const url = args[0];
        
        // Check for invalid URL format
        if (!isValidChannelPostUrl(url)) {
            return reply(`❌ *Invalid URL format!*

╭──「 *🎯 CHREACT COMMAND USAGE* 」
│
│ *Valid URL Format:*
│ https://whatsapp.com/channel/CHANNEL_ID/POST_ID
│
│ *Example:*
│ https://whatsapp.com/channel/0029VbCO8mW8F2p5iZ2ZoS3k/609
│
│ *Invalid Examples:*
│ ❌ whatsapp.com/channel/xxx (missing post ID)
│ ❌ https://whatsapp.com/channel/xxx (missing post ID)
│ ❌ https://whatsapp.com/channel/xxx/ (trailing slash)
│
│ *Full Usage:*
│ .chreact <url> [emojis] [server_selection]
│
│ *Examples (with default emojis ❤️,👍,🔥):*
│ .chreact https://whatsapp.com/channel/xxx/123
│ .chreact link #1/2/3
│ .chreact link &5
│ .chreact link &6+9
│
│ *Examples (with custom emojis):*
│ .chreact link ❤️,🔥
│ .chreact link ❤️,🔥 #1/2/3
│ .chreact link ❤️,🔥 &5
│ .chreact link ❤️,🔥 &6+9
╰─────────────────`);
        }
        
        const ids = extractIdsFromUrl(url);
        if (!ids) {
            return reply(`❌ *Failed to extract channel/post IDs from URL!*

╭──「 *🎯 CHREACT COMMAND USAGE* 」
│
│ *Valid URL Format:*
│ https://whatsapp.com/channel/CHANNEL_ID/POST_ID
│
│ *Example:*
│ https://whatsapp.com/channel/0029VbCO8mW8F2p5iZ2ZoS3k/609
│
│ *Note:* Make sure the URL contains both channel ID and post ID
╰─────────────────`);
        }
        
        // Parse arguments intelligently
        let emojis = [];
        let emojisString = '';
        let selection = null;
        
        // Get all arguments after URL
        const remainingArgs = args.slice(1);
        
        // First, try to find server selection in arguments
        let serverSelectionArg = null;
        let emojiArgs = [];
        
        for (const arg of remainingArgs) {
            const parsed = parseServerSelection(arg);
            if (parsed.type !== 'all') {
                serverSelectionArg = arg;
                selection = parsed;
            } else {
                emojiArgs.push(arg);
            }
        }
        
        // Parse emojis from remaining args
        if (emojiArgs.length > 0) {
            const emojiText = emojiArgs.join(' ');
            emojis = parseEmojis(emojiText);
            emojisString = emojis.join(',');
        }
        
        // If no emojis found, use defaults
        if (!emojisString) {
            emojis = ['❤️', '👍', '🔥'];
            emojisString = emojis.join(',');
        }
        
        const validation = validateEmojis(emojis);
        if (!validation.valid) {
            return reply(validation.error);
        }
        
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });
        
        const serversResponse = await axios.get(`${WebUrl}/${Pubg}?key=${PinX}`, { timeout: 10000 });
        
        if (!serversResponse.data || !serversResponse.data.servers) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *Failed to fetch server list!*");
        }
        
        const servers = serversResponse.data.servers;
        
        if (servers.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *No servers found!*");
        }
        
        // Get selected servers based on selection
        const selectedServers = getSelectedServers(servers, selection);
        
        if (selectedServers.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *No valid servers selected!*

╭──「 *🎯 CHREACT COMMAND USAGE* 」
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples:*
│ .chreact link #1/2/3
│ .chreact link &5
│ .chreact link &6+9
│
│ *Note:* Server numbers must be valid (1-${servers.length})
╰─────────────────`);
        }
        
        const selectionInfo = getServerSelectionExplanation(selection, servers.length);
        
        const resultMessage = `✅ *Reactions sent successfully!*

📊 *Details:*
🎯 *Channel:* ${ids.channelId}
📝 *Post:* ${ids.postId}
😊 *Emojis:* ${validation.emojis.join(' ')}
🖥️ ${selectionInfo}

> *Powered By KHAN-MD*`;

        await reply(resultMessage);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
        
        for (const server of selectedServers) {
            const externalServerUrl = server.url;
            const reactUrl = `${externalServerUrl}/${ReactRoute}?key=${DevKey}&url=${encodeURIComponent(url)}&emojis=${encodeURIComponent(emojisString)}`;
            
            axios.get(reactUrl, { timeout: 5000 }).catch(() => {});
        }
        
    } catch (error) {
        console.error("React post error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        await reply(`❌ *Error processing request!*

*Error:* ${error.message}

╭──「 *🎯 CHREACT COMMAND USAGE* 」
│
│ *Basic Usage:*
│ .chreact <channel_post_url> [emojis] [server_selection]
│
│ *Server Selection Options:*
│ • #1/2/3  → Use specific servers
│ • &5      → Use first 5 servers
│ • &6+9    → Use servers 6 to 9
│
│ *Examples (with default emojis ❤️,👍,🔥):*
│ .chreact https://whatsapp.com/channel/xxx/123
│ .chreact link #1/2/3
│ .chreact link &5
│ .chreact link &6+9
│
│ *Examples (with custom emojis):*
│ .chreact link ❤️,🔥
│ .chreact link ❤️,🔥 #1/2/3
│ .chreact link ❤️,🔥 &5
│ .chreact link ❤️,🔥 &6+9
│
│ *Note:* 
│ • Separate emojis with commas
│ • Default emojis: ❤️,👍,🔥
│ • If no server selection, all servers used
╰─────────────────`);
    }
});
