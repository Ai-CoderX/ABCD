// plugins/presence.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';

const __filename = fileURLToPath(import.meta.url);

// ===== READ MESSAGE =====
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, userConfig }) => {
    try {
        // Get READ_MESSAGE from userConfig if available, otherwise use config.READ_MESSAGE
        const READ_MESSAGE = userConfig?.READ_MESSAGE || config.READ_MESSAGE || 'false';
        
        if (READ_MESSAGE === 'true') {
            await conn.readMessages([mek.key]).catch(() => {});
        } else if (READ_MESSAGE === 'inbox') {
            if (!isGroup) {
                await conn.readMessages([mek.key]).catch(() => {});
            }
        } else if (READ_MESSAGE === 'group') {
            if (isGroup) {
                await conn.readMessages([mek.key]).catch(() => {});
            }
        }
    } catch (e) {
        // Silent fail
    }
});

// ===== ALWAYS ONLINE =====
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, userConfig }) => {
    try {
        // Get ALWAYS_ONLINE from userConfig if available, otherwise use config.ALWAYS_ONLINE
        const ALWAYS_ONLINE = userConfig?.ALWAYS_ONLINE || config.ALWAYS_ONLINE || "true";
        
        // Always online after reply
        if (ALWAYS_ONLINE === "true") {
            await conn.sendPresenceUpdate('available', from).catch(() => {});
        } else if (ALWAYS_ONLINE === "false") {
            await conn.sendPresenceUpdate('unavailable', from).catch(() => {});
        }
    } catch (e) {
        // Silent fail
    }
});

// ===== AUTO TYPING =====
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, userConfig }) => {
    try {
        // Get AUTO_TYPING from userConfig if available, otherwise use config.AUTO_TYPING
        const AUTO_TYPING = userConfig?.AUTO_TYPING || config.AUTO_TYPING || 'false';
        
        if (AUTO_TYPING === 'true') {
            await conn.sendPresenceUpdate('composing', from).catch(() => {});
        } 
        else if (AUTO_TYPING === 'inbox') {
            if (!isGroup) {
                await conn.sendPresenceUpdate('composing', from).catch(() => {});
            }
        }
        else if (AUTO_TYPING === 'group') {
            if (isGroup) {
                await conn.sendPresenceUpdate('composing', from).catch(() => {});
            }
        }
    } catch (e) {
        // Silent fail
    }
});

// ===== AUTO RECORDING =====
cmd({
    on: "body"
}, async (conn, mek, m, { from, isGroup, userConfig }) => {
    try {
        // Get AUTO_RECORDING from userConfig if available, otherwise use config.AUTO_RECORDING
        const AUTO_RECORDING = userConfig?.AUTO_RECORDING || config.AUTO_RECORDING || 'false';
        
        if (AUTO_RECORDING === 'true') {
            await conn.sendPresenceUpdate('recording', from).catch(() => {});
        }
        else if (AUTO_RECORDING === 'inbox') {
            if (!isGroup) {
                await conn.sendPresenceUpdate('recording', from).catch(() => {});
            }
        }
        else if (AUTO_RECORDING === 'group') {
            if (isGroup) {
                await conn.sendPresenceUpdate('recording', from).catch(() => {});
            }
        }
    } catch (e) {
        // Silent fail
    }
});