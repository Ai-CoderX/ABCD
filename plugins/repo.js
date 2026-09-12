// plugins/report.js - ESM Version (sendNode based)
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
    desc: "Report channel post (Method 1)",
    category: "tools",
    use: ".report1 <url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🚨 *Usage:* .report1 <url>");
        const url = args[0];

        if (!isValidChannelPostUrl(url)) return reply("❌ Invalid URL!");
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

        const node = {
            tag: 'iq',
            attrs: {
                to: channelJid,
                type: 'set',
                xmlns: 'w:newsletter:report',
                id: conn.generateMessageTag(true)
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
        };

        await conn.sendNode(node);

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        return reply(`✅ *Method 1 Sent*

╭──「 *📋 DETAILS* 」
│ 📢 ${channelInfo.name}
│ 🆔 ${channelJid}
│ 📝 Post: ${serverId}
│ 🔧 w:newsletter:report
╰─────────────────`);

    } catch (error) {
        console.error("Report1 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ Failed!\n\n${error.message}`);
    }
});

// ============================================
// .report2 → w:report
// ============================================
cmd({
    pattern: "report2",
    alias: ["reportpost2"],
    react: "🚨",
    desc: "Report channel post (Method 2)",
    category: "tools",
    use: ".report2 <url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        if (!args[0]) return reply("🚨 *Usage:* .report2 <url>");
        const url = args[0];

        if (!isValidChannelPostUrl(url)) return reply("❌ Invalid URL!");
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

        const node = {
            tag: 'iq',
            attrs: {
                to: 's.whatsapp.net',
                type: 'set',
                xmlns: 'w:report',
                id: conn.generateMessageTag(true)
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
        };

        await conn.sendNode(node);

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        return reply(`✅ *Method 2 Sent*

╭──「 *📋 DETAILS* 」
│ 📢 ${channelInfo.name}
│ 🆔 ${channelJid}
│ 📝 Post: ${serverId}
│ 🔧 w:report
╰─────────────────`);

    } catch (error) {
        console.error("Report2 error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ Failed!\n\n${error.message}`);
    }
});
