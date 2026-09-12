// plugins/report.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ============================================
// HELPERS
// ============================================
function isValidChannelPostUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    return pattern.test(url);
}

function extractIdsFromUrl(url) {
    const match = url.match(/\/channel\/([a-zA-Z0-9]+)\/(\d+)/);
    if (match) return { channelId: match[1], postId: match[2] };
    return null;
}

async function getChannelJidFromInvite(conn, inviteId) {
    try {
        const metadata = await conn.newsletterMetadata("invite", inviteId);
        if (metadata && metadata.id) {
            return { jid: metadata.id, name: metadata.name || 'Unknown Channel' };
        }
        return null;
    } catch (e) {
        return null;
    }
}

// ============================================
// .report1 → w:newsletter:report
// ============================================
cmd({
    pattern: "report1",
    alias: ["reportpost1"],
    react: "🚨",
    desc: "Report channel post (Method 1: w:newsletter:report)",
    category: "tools",
    use: ".report1 <url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🚨 *Usage:* .report1 <channel_post_url>");
        const url = args[0];

        if (!isValidChannelPostUrl(url)) return reply("❌ Invalid URL format!");
        const ids = extractIdsFromUrl(url);
        if (!ids) return reply("❌ Failed to extract IDs!");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const channelInfo = await getChannelJidFromInvite(conn, ids.channelId);
        if (!channelInfo) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ Channel not found!`);
        }

        const channelJid = channelInfo.jid;
        const serverId = ids.postId;

        // METHOD 1
        const result = await conn.query({
            tag: 'iq',
            attrs: {
                to: channelJid,
                type: 'set',
                xmlns: 'w:newsletter:report'
            },
            content: [
                {
                    tag: 'report',
                    attrs: {
                        server_id: String(serverId),
                        channel_jid: channelJid
                    }
                }
            ]
        });

        if (result?.attrs?.type === 'error') {
            throw new Error(result.content?.[0]?.attrs?.text || 'Report failed');
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        return reply(`✅ *Method 1 Report Sent*

╭──「 *📋 DETAILS* 」
│ 📢 Channel: ${channelInfo.name}
│ 🆔 JID: ${channelJid}
│ 📝 Post ID: ${serverId}
│ 🔧 Method: w:newsletter:report
╰─────────────────`);

    } catch (error) {
        console.error("Report1 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ *Failed!*\n\nError: ${error.message}`);
    }
});

// ============================================
// .report2 → w:report
// ============================================
cmd({
    pattern: "report2",
    alias: ["reportpost2"],
    react: "🚨",
    desc: "Report channel post (Method 2: w:report)",
    category: "tools",
    use: ".report2 <url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🚨 *Usage:* .report2 <channel_post_url>");
        const url = args[0];

        if (!isValidChannelPostUrl(url)) return reply("❌ Invalid URL format!");
        const ids = extractIdsFromUrl(url);
        if (!ids) return reply("❌ Failed to extract IDs!");

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const channelInfo = await getChannelJidFromInvite(conn, ids.channelId);
        if (!channelInfo) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ Channel not found!`);
        }

        const channelJid = channelInfo.jid;
        const serverId = ids.postId;

        // METHOD 2
        const result = await conn.query({
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'w:report'
            },
            content: [
                {
                    tag: 'report',
                    attrs: {
                        jid: channelJid,
                        server_id: String(serverId)
                    }
                }
            ]
        });

        if (result?.attrs?.type === 'error') {
            throw new Error(result.content?.[0]?.attrs?.text || 'Report failed');
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        return reply(`✅ *Method 2 Report Sent*

╭──「 *📋 DETAILS* 」
│ 📢 Channel: ${channelInfo.name}
│ 🆔 JID: ${channelJid}
│ 📝 Post ID: ${serverId}
│ 🔧 Method: w:report
╰─────────────────`);

    } catch (error) {
        console.error("Report2 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ *Failed!*\n\nError: ${error.message}`);
    }
});
