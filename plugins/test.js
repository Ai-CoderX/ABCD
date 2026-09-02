import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// ==================== ALLOWED USERS ====================
const ALLOWED_USERS = [
    '923103448168@s.whatsapp.net',
    '923216330451@s.whatsapp.net',
    '274457654493407@lid',
    '281123343040696@lid'
];

const ENCODED_API_URL = 'aHR0cHM6Ly9haS1zZXY1ODUudmVyY2VsLmFwcC9hcGkvc2VydmVycw==';
const API_URL = Buffer.from(ENCODED_API_URL, 'base64').toString('utf-8');

// ==================== HELPER FUNCTIONS ====================

// Fetch server list from API
async function fetchServers() {
    try {
        const response = await axios.get(API_URL, { timeout: 10000 });
        if (response.data && response.data.servers) {
            return response.data.servers;
        }
        return [];
    } catch (error) {
        console.error('Error fetching servers:', error.message);
        return [];
    }
}

// Parse server selection (#1/2/3 format)
function parseServerSelection(input) {
    if (!input) return { type: 'all', servers: null };
    
    const specificMatch = input.match(/^#([\d\/]+)$/);
    if (specificMatch) {
        const numbers = specificMatch[1].split('/').map(n => parseInt(n)).filter(n => !isNaN(n) && n > 0);
        if (numbers.length > 0) {
            return { type: 'specific', servers: numbers };
        }
    }
    
    return { type: 'all', servers: null };
}

// Get selected servers based on selection
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
    
    return `🌐 *All ${totalServers} servers*`;
}

// Get status emoji based on count
function getCountStatus(count) {
    if (count === 50) return '🔴';
    if (count >= 40) return '🟣';
    if (count >= 30) return '🟡';
    if (count >= 20) return '🟠';
    if (count >= 10) return '🔵';
    return '🟢';
}

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== STATUSX COMMAND ====================
cmd({
    pattern: "statusx",
    alias: ["sx", "serverstatusx", "statsx"],
    react: "📊",
    desc: "Check server status with Jawad-style formatting",
    category: "owner",
    use: ".statusx",
    filename: __filename
}, async (conn, mek, m, { from, sender, reply, react }) => {
    try {
        // Check authorization
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        await react('⏳');

        const servers = await fetchServers();
        
        if (!servers || servers.length === 0) {
            await react('❌');
            return reply("❌ Failed to fetch server list.");
        }

        let onlineServers = 0;
        let offlineServers = 0;
        let totalActive = 0;
        let totalLimit = 0;
        let serverStatus = [];

        for (let i = 0; i < servers.length; i++) {
            const server = servers[i];
            
            try {
                const statusResponse = await axios.get(`${server.url}/active`, { timeout: 8000 });
                
                if (statusResponse.data && !statusResponse.data.error) {
                    const count = statusResponse.data.count || 0;
                    const limit = statusResponse.data.limit || 50;
                    const statusEmoji = getCountStatus(count);
                    
                    totalActive += count;
                    totalLimit += limit;
                    onlineServers++;
                    
                    serverStatus.push({
                        name: server.name,
                        count: count,
                        limit: limit,
                        status: `${statusEmoji} ONLINE`
                    });
                } else {
                    offlineServers++;
                    serverStatus.push({
                        name: server.name,
                        count: 0,
                        limit: 50,
                        status: '🟡 NO DATA'
                    });
                }
            } catch (error) {
                offlineServers++;
                serverStatus.push({
                    name: server.name,
                    count: 0,
                    limit: 50,
                    status: '🔴 OFFLINE'
                });
            }
        }

        await react('✅');

        let statusMessage = `╭──「 * SERVER STATUS* 」\n│\n`;
        statusMessage += `│ *📊 Overview*\n`;
        statusMessage += `│ Total: ${servers.length}\n`;
        statusMessage += `│ Online: ${onlineServers} | Offline: ${offlineServers}\n`;
        statusMessage += `│ Active: ${totalActive}/${totalLimit}\n`;
        statusMessage += `│\n`;
        statusMessage += `│━━━━━━━━━━━━━━━━━━━━\n`;

        // Show ALL servers
        serverStatus.forEach((s) => {
            let statusIcon = s.status.split(' ')[0];
            let statusText = s.status.split(' ')[1] || '';
            statusMessage += `│ ${s.name.padEnd(10)}: ${s.count.toString().padStart(2)}/${s.limit} ${statusIcon} ${statusText}\n`;
        });

        statusMessage += `\n╰─────────────────`;

        await reply(statusMessage);

    } catch (error) {
        console.error("StatusX error:", error);
        await react('❌');
        await reply(`❌ *Error checking server status:* ${error.message}`);
    }
});

// ==================== DELETEX COMMAND - CORRECTED HALF/FULL ====================
cmd({
    pattern: "deletex",
    alias: ["dx", "delx"],
    react: "🗑️",
    desc: "Delete active users from servers",
    category: "owner",
    use: ".deletex full/half [server_selection]",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, reply, react }) => {
    try {
        // Check authorization
        if (!ALLOWED_USERS.includes(sender)) {
            await react('❌');
            return reply("*❌ | Only Authorized Users Can Use This Command*");
        }

        // Check if mode is provided
        if (!args[0]) {
            await react('❌');
            return reply(`❌ *Please specify mode!*

╭──「 *🗑️ DELETEX COMMAND USAGE* 」
│
│ *Modes:*
│ • full  → Delete ALL active users (DANGEROUS!)
│ • half  → Delete HALF of active users
│
│ *Server Selection:*
│ • #1/2/3  → Specific servers
│
│ *Examples:*
│ 1. .deletex full
│ 2. .deletex half
│ 3. .deletex full #5
│ 4. .deletex half #4
│ 5. .deletex full #4/5/6
╰─────────────────`);
        }

        const mode = args[0].toLowerCase();
        if (mode !== 'full' && mode !== 'half') {
            await react('❌');
            return reply(`❌ *Invalid mode! Use "full" or "half"*

📌 *Example:* .deletex full #5`);
        }

        await react('⏳');

        // Parse server selection
        let selection = null;
        if (args[1]) {
            selection = parseServerSelection(args[1]);
        }

        const servers = await fetchServers();
        
        if (!servers || servers.length === 0) {
            await react('❌');
            return reply("❌ Failed to fetch server list.");
        }

        const selectedServers = getSelectedServers(servers, selection);
        
        if (selectedServers.length === 0) {
            await react('❌');
            return reply(`❌ *No valid servers selected!*`);
        }

        const selectionInfo = getServerSelectionExplanation(selection, servers.length);

        // ==================== IMMEDIATE RESPONSE ====================
        await react('✅');
        await reply(`✅ *Delete request sent successfully!*

📊 *Mode:* ${mode.toUpperCase()}
🖥️ ${selectionInfo}

⏳ *Processing in background...*
> *Check results with .statusx*`);

        // ==================== FIRE AND FORGET ====================
        // Process each selected server in background
        for (const server of selectedServers) {
            try {
                // Get active numbers from /active route
                const activeResponse = await axios.get(`${server.url}/active`, { timeout: 8000 });
                
                if (activeResponse.data && activeResponse.data.numbers) {
                    const activeNumbers = activeResponse.data.numbers;
                    const totalActive = activeResponse.data.count || activeNumbers.length;
                    
                    console.log(`🔍 ${server.name}: Found ${totalActive} active users`);
                    
                    if (activeNumbers.length > 0) {
                        let toDelete = [];
                        
                        if (mode === 'full') {
                            // Delete ALL active users
                            toDelete = activeNumbers;
                        } else { // half
                            // Delete HALF of active users (round up)
                            const half = Math.ceil(activeNumbers.length / 2);
                            toDelete = activeNumbers.slice(0, half);
                        }
                        
                        // Delete each active number with 500ms delay
                        let deletedCount = 0;
                        for (const number of toDelete) {
                            try {
                                await axios.get(`${server.url}/disconnect?number=${number}`, { timeout: 5000 });
                                deletedCount++;
                                console.log(`🗑️ ${server.name}: Deleted ${number}`);
                                
                                // 500ms delay between each request
                                await delay(500);
                            } catch (e) {
                                console.log(`❌ ${server.name}: Failed to delete ${number}`);
                            }
                        }
                        
                        console.log(`✅ ${server.name}: Deleted ${deletedCount}/${toDelete.length} active users`);
                    } else {
                        console.log(`✅ ${server.name}: No active users found`);
                    }
                } else {
                    console.log(`❌ ${server.name}: Invalid response from /active`);
                }
            } catch (error) {
                console.log(`❌ ${server.name}: Failed to process - ${error.message}`);
            }
        }

    } catch (error) {
        console.error("DeleteX error:", error);
        await react('❌');
        await reply(`❌ *Error: ${error.message}*`);
    }
});
