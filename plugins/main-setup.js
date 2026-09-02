// plugins/block.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import { lidToPhone } from '../lib/functions.js';

const __filename = fileURLToPath(import.meta.url);

// Function to extract JID with LID to PN conversion
async function extractJid(client, m, q) {
    // If replying to a message
    if (m.quoted) {
        let jid = m.quoted.sender;
        // Convert LID to PN if needed
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    // Ensure it has @s.whatsapp.net suffix
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {
                // Keep original JID if conversion fails
            }
        }
        return jid;
    }
    
    // If mentioning someone
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        let jid = m.mentionedJid[0];
        // Convert LID to PN if needed
        if (jid && jid.includes('@lid')) {
            try {
                const phoneNumber = await lidToPhone(client, jid);
                if (phoneNumber) {
                    // Ensure it has @s.whatsapp.net suffix
                    jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                }
            } catch (e) {
                // Keep original JID if conversion fails
            }
        }
        return jid;
    }
    
    // If manually typing a number or JID
    if (q) {
        // Check if it's already a JID format
        if (q.includes('@') || q.includes('lid')) {
            let jid = q;
            // Convert LID to PN if needed
            if (jid && jid.includes('@lid')) {
                try {
                    const phoneNumber = await lidToPhone(client, jid);
                    if (phoneNumber) {
                        // Ensure it has @s.whatsapp.net suffix
                        jid = phoneNumber.includes('@') ? phoneNumber : phoneNumber + "@s.whatsapp.net";
                    }
                } catch (e) {
                    // Keep original JID if conversion fails
                }
            }
            return jid;
        }
        
        // Clean the number and add @s.whatsapp.net
        const cleanNumber = q.replace(/[^0-9]/g, '');
        if (cleanNumber.length >= 10) {
            return cleanNumber + "@s.whatsapp.net";
        }
    }
    
    return null;
}

cmd({
    pattern: "block",
    desc: "Blocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🚫",
    filename: __filename
}, async (client, message, m, { 
    from, 
    isCreator,
    q,
    react
}) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        let jid = await extractJid(client, m, q);
        
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }

        // Ensure JID has @s.whatsapp.net suffix
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }

        try {
            await client.updateBlockStatus(jid, "block");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully blocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Block command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to block the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Block command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to block the user."
        }, { quoted: message });
    }
});

cmd({
    pattern: "unblock",
    desc: "Unblocks a person (supports LID to PN conversion)",
    category: "owner",
    react: "🔓",
    filename: __filename
}, async (client, message, m, { 
    from, 
    isCreator,
    q,
    react
}) => {
    try {
        if (!isCreator) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "*📛 This is an owner command.*"
            }, { quoted: message });
        }

        let jid = await extractJid(client, m, q);
        
        if (!jid) {
            await react("❌");
            return await client.sendMessage(from, {
                text: "Please mention a user or reply to their message."
            }, { quoted: message });
        }

        // Ensure JID has @s.whatsapp.net suffix
        if (!jid.includes('@s.whatsapp.net') && !jid.includes('@lid')) {
            jid = jid + "@s.whatsapp.net";
        }

        try {
            await client.updateBlockStatus(jid, "unblock");
            await react("✅");
            await client.sendMessage(from, {
                text: "Successfully unblocked user",
                mentions: [jid]
            }, { quoted: message });
        } catch (error) {
            console.error("Unblock command error:", error);
            await react("❌");
            await client.sendMessage(from, {
                text: "Failed to unblock the user."
            }, { quoted: message });
        }
    } catch (error) {
        console.error("Unblock command error:", error);
        await react("❌");
        await client.sendMessage(from, {
            text: "Failed to unblock the user."
        }, { quoted: message });
    }
});
