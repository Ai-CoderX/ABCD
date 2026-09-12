// plugins/report.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);

// ============================================
// URL VALIDATION
// ============================================
function isValidChannelPostUrl(url) {
    const pattern = /^https?:\/\/(?:www\.)?whatsapp\.com\/channel\/[a-zA-Z0-9]+\/\d+$/;
    return pattern.test(url);
}

// ============================================
// EXTRACT CHANNEL ID + POST ID FROM URL
// ============================================
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

// ============================================
// GET CHANNEL JID FROM INVITE
// ============================================
async function getChannelJidFromInvite(conn, inviteId) {
    try {
        const metadata = await conn.newsletterMetadata("invite", inviteId);
        if (metadata && metadata.id) {
            return {
                jid: metadata.id,
                name: metadata.name || 'Unknown Channel'
            };
        }
        return null;
    } catch (e) {
        console.error("Channel metadata error:", e.message);
        return null;
    }
}

// ============================================
// REPORT COMMAND
// ============================================
cmd({
    pattern: "reportx",
    alias: ["reportpost", "reportch"],
    react: "🚨",
    desc: "Report a WhatsApp channel post using its link",
    category: "tools",
    use: ".report <channel_post_url>",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        // No args → show usage
        if (!args[0]) {
            return reply(`🚨 *REPORT CHANNEL POST*

╭──「 *📌 USAGE* 」
│
│ *.report <channel_post_url>*
│
│ *Valid URL Format:*
│ https://whatsapp.com/channel/CHANNEL_ID/POST_ID
│
│ *Example:*
│ .report https://whatsapp.com/channel/0029VbCO8mW8F2p5iZ2ZoS3k/609
│
│ *Note:*
│ • Report is anonymous
│ • No one in the channel will know
╰─────────────────`);
        }

        const url = args[0];

        // Validate URL format
        if (!isValidChannelPostUrl(url)) {
            return reply(`❌ *Invalid URL format!*

*Valid Format:*
https://whatsapp.com/channel/CHANNEL_ID/POST_ID

*Example:*
.report https://whatsapp.com/channel/0029VbCO8mW8F2p5iZ2ZoS3k/609`);
        }

        // Extract IDs
        const ids = extractIdsFromUrl(url);
        if (!ids) {
            return reply(`❌ *Failed to extract Channel ID and Post ID from URL!*

Make sure the URL contains both:
• Channel ID
• Post ID (numbers at the end)`);
        }

        // React: processing
        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        // Get channel JID from invite ID
        const channelInfo = await getChannelJidFromInvite(conn, ids.channelId);
        if (!channelInfo) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply(`❌ *Failed to fetch channel info!*

The channel invite may be invalid or expired.
Channel ID: ${ids.channelId}`);
        }

        const channelJid = channelInfo.jid;
        const serverId = ids.postId;

        // ============================================
        // SEND REPORT (Simple - matches WhatsApp UI)
        // ============================================
        const result = await conn.query({
            tag: 'iq',
            attrs: {
                to: channelJid,
                type: 'set',
                xmlns: 'w:newsletter'
            },
            content: [
                {
                    tag: 'report',
                    attrs: {},
                    content: [
                        {
                            tag: 'message',
                            attrs: { server_id: String(serverId) }
                        }
                    ]
                }
            ]
        });

        // Check for error response
        if (result?.attrs?.type === 'error') {
            throw new Error(
                result.content?.[0]?.attrs?.text || 'Report failed'
            );
        }

        // React: success
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

        // Success message
        return reply(`✅ *Channel post reported successfully!*

╭──「 *📋 REPORT DETAILS* 」
│
│ 📢 *Channel:* ${channelInfo.name}
│ 🆔 *Channel JID:* ${channelJid}
│ 📝 *Post ID:* ${serverId}
│ 🚨 *Status:* Reported to WhatsApp
│ 🔒 *Privacy:* Anonymous
│
╰─────────────────

> *© Powered By KHAN-MD-♡*`);

    } catch (error) {
        console.error("Report command error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        return reply(`❌ *Error reporting post!*

*Error:* ${error.message || 'Unknown error'}

╭──「 *📌 USAGE* 」
│
│ *.report <channel_post_url>*
│
│ *Example:*
│ .report https://whatsapp.com/channel/xxx/123
╰─────────────────`);
    }
});
