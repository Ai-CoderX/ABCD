import { fileURLToPath } from 'url';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { tmpdir } from 'os';
import { randomBytes } from 'crypto';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import { cmd } from '../command.js';

const __filename = fileURLToPath(import.meta.url);
ffmpeg.setFfmpegPath(ffmpegPath.path);

// ========== ENCODED API URLS ==========
const FIRST_ENCODED_API_URL = 'aHR0cHM6Ly9uZWtvcy5iZXN0L2FwaS92Mi8=';
const FIRST_API_URL = Buffer.from(FIRST_ENCODED_API_URL, 'base64').toString('utf-8');

const SECOND_ENCODED_API_URL = 'aHR0cHM6Ly9hcGkucHVycmJvdC5zaXRlL3YyL2ltZy9zZncv';
const SECOND_API_URL = Buffer.from(SECOND_ENCODED_API_URL, 'base64').toString('utf-8');

const THIRD_ENCODED_API_URL = 'aHR0cHM6Ly9hcGkub3Rha3VnaWZzLnh5ei9naWY/cmVhY3Rpb249';
const THIRD_API_URL = Buffer.from(THIRD_ENCODED_API_URL, 'base64').toString('utf-8');

const FOURTH_ENCODED_API_URL = 'aHR0cHM6Ly9uZWtvcy5saWZlL2FwaS92Mi9pbWcv';
const FOURTH_API_URL = Buffer.from(FOURTH_ENCODED_API_URL, 'base64').toString('utf-8');

// ========== GET GIF — tries all APIs with same action ==========
async function getGifX(action) {
    const sources = [
        async () => {
            const r = await axios.get(`${FIRST_API_URL}${action}`);
            return r.data?.results?.[0]?.url || null;
        },
        async () => {
            const r = await axios.get(`${SECOND_API_URL}${action}/gif`);
            return (r.data?.error === false && r.data?.link) ? r.data.link : null;
        },
        async () => {
            const r = await axios.get(`${THIRD_API_URL}${action}`);
            return r.data?.url || null;
        },
        async () => {
            const r = await axios.get(`${FOURTH_API_URL}${action}`);
            return r.data?.url || null;
        }
    ];
    for (const src of sources) {
        try {
            const url = await src();
            if (url) return url;
        } catch (_) {}
    }
    throw new Error('No reaction GIF source available.');
}

// ========== GIF → VIDEO ==========
async function gifToVideo(gifBuffer) {
    const id = randomBytes(6).toString('hex');
    const gifPath = path.join(tmpdir(), `${id}.gif`);
    const mp4Path = path.join(tmpdir(), `${id}.mp4`);
    fs.writeFileSync(gifPath, gifBuffer);
    await new Promise((res, rej) => {
        ffmpeg(gifPath)
            .outputOptions(['-movflags faststart','-pix_fmt yuv420p','-vf scale=trunc(iw/2)*2:trunc(ih/2)*2'])
            .on('error', () => rej(new Error('Could not process GIF to video.')))
            .on('end', res)
            .save(mp4Path);
    });
    const v = fs.readFileSync(mp4Path);
    fs.unlinkSync(gifPath); fs.unlinkSync(mp4Path);
    return v;
}

// ==================== LURK COMMAND ====================
cmd({
    pattern: "lurk",
    desc: "Send a lurk reaction GIF.",
    category: "fun",
    react: "👀",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is lurking @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is lurking everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("lurk");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .lurk command:", error);
        reply(`❌ *Error in .lurk command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SHOOT COMMAND ====================
cmd({
    pattern: "shoot",
    desc: "Send a shoot reaction GIF.",
    category: "fun",
    react: "🔫",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} shot @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} shot everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shoot");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .shoot command:", error);
        reply(`❌ *Error in .shoot command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SLEEP COMMAND ====================
cmd({
    pattern: "sleep",
    desc: "Send a sleep reaction GIF.",
    category: "fun",
    react: "😴",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is sleeping with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is sleeping!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("sleep");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .sleep command:", error);
        reply(`❌ *Error in .sleep command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CLAP COMMAND ====================
cmd({
    pattern: "clap",
    desc: "Send a clap reaction GIF.",
    category: "fun",
    react: "👏",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} clapped for @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} clapped for everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("clap");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .clap command:", error);
        reply(`❌ *Error in .clap command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SHRUG COMMAND ====================
cmd({
    pattern: "shrug",
    desc: "Send a shrug reaction GIF.",
    category: "fun",
    react: "🤷",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} shrugged at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} shrugged at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shrug");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .shrug command:", error);
        reply(`❌ *Error in .shrug command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== STARE COMMAND ====================
cmd({
    pattern: "stare",
    desc: "Send a stare reaction GIF.",
    category: "fun",
    react: "👀",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is staring at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is staring at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("stare");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .stare command:", error);
        reply(`❌ *Error in .stare command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== WAVE COMMAND ====================
cmd({
    pattern: "wave",
    desc: "Send a wave reaction GIF.",
    category: "fun",
    react: "👋",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} waved at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is waving at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("wave");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .wave command:", error);
        reply(`❌ *Error in .wave command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== POKE COMMAND ====================
cmd({
    pattern: "poke",
    desc: "Send a poke reaction GIF.",
    category: "fun",
    react: "👉",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} poked @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} poked everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("poke");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .poke command:", error);
        reply(`❌ *Error in .poke command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CONFUSED COMMAND ====================
cmd({
    pattern: "confused",
    desc: "Send a confused reaction GIF.",
    category: "fun",
    react: "😕",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is confused by @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is confused!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("confused");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .confused command:", error);
        reply(`❌ *Error in .confused command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SMILE COMMAND ====================
cmd({
    pattern: "smile",
    desc: "Send a smile reaction GIF.",
    category: "fun",
    react: "😁",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} smiled at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is smiling at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("smile");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .smile command:", error);
        reply(`❌ *Error in .smile command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== PECK COMMAND ====================
cmd({
    pattern: "peck",
    desc: "Send a peck reaction GIF.",
    category: "fun",
    react: "🐦",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} pecked @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} pecked everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("peck");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .peck command:", error);
        reply(`❌ *Error in .peck command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== WINK COMMAND ====================
cmd({
    pattern: "wink",
    desc: "Send a wink reaction GIF.",
    category: "fun",
    react: "😉",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} winked at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is winking at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("wink");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .wink command:", error);
        reply(`❌ *Error in .wink command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SIP COMMAND ====================
cmd({
    pattern: "sip",
    desc: "Send a sip reaction GIF.",
    category: "fun",
    react: "☕",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is sipping with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is sipping!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("sip");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .sip command:", error);
        reply(`❌ *Error in .sip command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BLUSH COMMAND ====================
cmd({
    pattern: "blush",
    desc: "Send a blush reaction GIF.",
    category: "fun",
    react: "😊",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is blushing at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is blushing!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("blush");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .blush command:", error);
        reply(`❌ *Error in .blush command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SMUG COMMAND ====================
cmd({
    pattern: "smug",
    desc: "Send a smug reaction GIF.",
    category: "fun",
    react: "😏",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is smug at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is feeling smug!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("smug");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .smug command:", error);
        reply(`❌ *Error in .smug command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== TICKLE COMMAND ====================
cmd({
    pattern: "tickle",
    desc: "Send a tickle reaction GIF.",
    category: "fun",
    react: "🤣",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} tickled @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} tickled everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("tickle");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .tickle command:", error);
        reply(`❌ *Error in .tickle command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== YEET COMMAND ====================
cmd({
    pattern: "yeet",
    desc: "Send a yeet reaction GIF.",
    category: "fun",
    react: "💨",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} yeeted @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is yeeting everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("yeet");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .yeet command:", error);
        reply(`❌ *Error in .yeet command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== THINK COMMAND ====================
cmd({
    pattern: "think",
    desc: "Send a think reaction GIF.",
    category: "fun",
    react: "🤔",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is thinking about @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is thinking!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("think");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .think command:", error);
        reply(`❌ *Error in .think command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HIGHFIVE COMMAND ====================
cmd({
    pattern: "highfive",
    desc: "Send a highfive reaction GIF.",
    category: "fun",
    react: "✋",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} gave a high-five to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is high-fiving everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("highfive");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .highfive command:", error);
        reply(`❌ *Error in .highfive command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== FEED COMMAND ====================
cmd({
    pattern: "feed",
    desc: "Send a feed reaction GIF.",
    category: "fun",
    react: "🍕",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is feeding @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is feeding everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("feed");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .feed command:", error);
        reply(`❌ *Error in .feed command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BITE COMMAND ====================
cmd({
    pattern: "bite",
    desc: "Send a bite reaction GIF.",
    category: "fun",
    react: "🦷",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} bit @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is biting everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("bite");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .bite command:", error);
        reply(`❌ *Error in .bite command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== TEEHEE COMMAND ====================
cmd({
    pattern: "teehee",
    desc: "Send a teehee reaction GIF.",
    category: "fun",
    react: "😜",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} teehee'd at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} teehee'd at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("teehee");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .teehee command:", error);
        reply(`❌ *Error in .teehee command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SHOCKED COMMAND ====================
cmd({
    pattern: "shocked",
    desc: "Send a shocked reaction GIF.",
    category: "fun",
    react: "😮",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is shocked by @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is shocked!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shocked");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .shocked command:", error);
        reply(`❌ *Error in .shocked command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BLEH COMMAND ====================
cmd({
    pattern: "bleh",
    desc: "Send a bleh reaction GIF.",
    category: "fun",
    react: "😝",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} bleh'd at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} bleh'd at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("bleh");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .bleh command:", error);
        reply(`❌ *Error in .bleh command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BORED COMMAND ====================
cmd({
    pattern: "bored",
    desc: "Send a bored reaction GIF.",
    category: "fun",
    react: "😑",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is bored by @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is bored!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("bored");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .bored command:", error);
        reply(`❌ *Error in .bored command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NOM COMMAND ====================
cmd({
    pattern: "nom",
    desc: "Send a nom reaction GIF.",
    category: "fun",
    react: "🍽️",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is nomming @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is nomming everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nom");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nom command:", error);
        reply(`❌ *Error in .nom command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NYA COMMAND ====================
cmd({
    pattern: "nya",
    desc: "Send a nya reaction GIF.",
    category: "fun",
    react: "😺",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} nya'd at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} nya'd at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nya");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nya command:", error);
        reply(`❌ *Error in .nya command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== YAWN COMMAND ====================
cmd({
    pattern: "yawn",
    desc: "Send a yawn reaction GIF.",
    category: "fun",
    react: "🥱",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} yawned at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} yawned at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("yawn");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .yawn command:", error);
        reply(`❌ *Error in .yawn command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== FACEPALM COMMAND ====================
cmd({
    pattern: "facepalm",
    desc: "Send a facepalm reaction GIF.",
    category: "fun",
    react: "🤦",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} facepalmed at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} facepalmed at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("facepalm");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .facepalm command:", error);
        reply(`❌ *Error in .facepalm command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CUDDLE COMMAND ====================
cmd({
    pattern: "cuddle",
    desc: "Send a cuddle reaction GIF.",
    category: "fun",
    react: "🤗",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} cuddled @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is cuddling everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("cuddle");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .cuddle command:", error);
        reply(`❌ *Error in .cuddle command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== KICK COMMAND ====================
cmd({
    pattern: "kick",
    desc: "Send a kick reaction GIF.",
    category: "fun",
    react: "🦶",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} kicked @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} kicked everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("kick");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .kick command:", error);
        reply(`❌ *Error in .kick command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HAPPY COMMAND ====================
cmd({
    pattern: "happy",
    desc: "Send a happy reaction GIF.",
    category: "fun",
    react: "😄",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is happy with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is happy!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("happy");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .happy command:", error);
        reply(`❌ *Error in .happy command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CARRY COMMAND ====================
cmd({
    pattern: "carry",
    desc: "Send a carry reaction GIF.",
    category: "fun",
    react: "🏃",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} carried @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} carried everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("carry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .carry command:", error);
        reply(`❌ *Error in .carry command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HUG COMMAND ====================
cmd({
    pattern: "hug",
    desc: "Send a hug reaction GIF.",
    category: "fun",
    react: "🤗",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} hugged @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is hugging everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("hug");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .hug command:", error);
        reply(`❌ *Error in .hug command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== KABEDON COMMAND ====================
cmd({
    pattern: "kabedon",
    desc: "Send a kabedon reaction GIF.",
    category: "fun",
    react: "🧱",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} kabedon'd @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} kabedon'd everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("kabedon");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .kabedon command:", error);
        reply(`❌ *Error in .kabedon command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BAKA COMMAND ====================
cmd({
    pattern: "baka",
    desc: "Send a baka reaction GIF.",
    category: "fun",
    react: "😤",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} called @${mentionedUser.split("@")[0]} baka`
            : isGroup
            ? `${sender} called everyone baka!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("baka");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .baka command:", error);
        reply(`❌ *Error in .baka command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BONK COMMAND ====================
cmd({
    pattern: "bonk",
    desc: "Send a bonk reaction GIF.",
    category: "fun",
    react: "🔨",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} bonked @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} bonked everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("bonk");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .bonk command:", error);
        reply(`❌ *Error in .bonk command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== PAT COMMAND ====================
cmd({
    pattern: "pat",
    desc: "Send a pat reaction GIF.",
    category: "fun",
    react: "🫂",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} patted @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is patting everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("pat");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .pat command:", error);
        reply(`❌ *Error in .pat command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== ANGRY COMMAND ====================
cmd({
    pattern: "angry",
    desc: "Send an angry reaction GIF.",
    category: "fun",
    react: "😡",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is angry at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is angry!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("angry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .angry command:", error);
        reply(`❌ *Error in .angry command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SPIN COMMAND ====================
cmd({
    pattern: "spin",
    desc: "Send a spin reaction GIF.",
    category: "fun",
    react: "🔄",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} spun @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} spun everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("spin");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .spin command:", error);
        reply(`❌ *Error in .spin command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SHAKE COMMAND ====================
cmd({
    pattern: "shake",
    desc: "Send a shake reaction GIF.",
    category: "fun",
    react: "🤝",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} shook @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} shook everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shake");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .shake command:", error);
        reply(`❌ *Error in .shake command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== RUN COMMAND ====================
cmd({
    pattern: "run",
    desc: "Send a run reaction GIF.",
    category: "fun",
    react: "🏃",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} ran from @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} ran from everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("run");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .run command:", error);
        reply(`❌ *Error in .run command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NOD COMMAND ====================
cmd({
    pattern: "nod",
    desc: "Send a nod reaction GIF.",
    category: "fun",
    react: "🙂",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} nodded at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} nodded at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nod");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nod command:", error);
        reply(`❌ *Error in .nod command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NOPE COMMAND ====================
cmd({
    pattern: "nope",
    desc: "Send a nope reaction GIF.",
    category: "fun",
    react: "🙅",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} said nope to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} said nope to everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nope");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nope command:", error);
        reply(`❌ *Error in .nope command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== KISS COMMAND ====================
cmd({
    pattern: "kiss",
    desc: "Send a kiss reaction GIF.",
    category: "fun",
    react: "💋",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} kissed @${mentionedUser.split("@")[0]} 🥰`
            : isGroup
            ? `${sender} kissed everyone! 💋`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("kiss");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .kiss command:", error);
        reply(`❌ *Error in .kiss command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== DANCE COMMAND ====================
cmd({
    pattern: "dance",
    desc: "Send a dance reaction GIF.",
    category: "fun",
    react: "💃",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} danced with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is dancing with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("dance");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .dance command:", error);
        reply(`❌ *Error in .dance command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== PUNCH COMMAND ====================
cmd({
    pattern: "punch",
    desc: "Send a punch reaction GIF.",
    category: "fun",
    react: "👊",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} punched @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} punched everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("punch");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .punch command:", error);
        reply(`❌ *Error in .punch command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HANDSHAKE COMMAND ====================
cmd({
    pattern: "handshake",
    desc: "Send a handshake reaction GIF.",
    category: "fun",
    react: "🤝",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} shook hands with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} shook hands with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("handshake");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .handshake command:", error);
        reply(`❌ *Error in .handshake command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SLAP COMMAND ====================
cmd({
    pattern: "slap",
    desc: "Send a slap reaction GIF.",
    category: "fun",
    react: "✊",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} slapped @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} slapped everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("slap");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .slap command:", error);
        reply(`❌ *Error in .slap command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CRY COMMAND ====================
cmd({
    pattern: "cry",
    desc: "Send a cry reaction GIF.",
    category: "fun",
    react: "😢",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is crying over @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is crying!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("cry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .cry command:", error);
        reply(`❌ *Error in .cry command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== POUT COMMAND ====================
cmd({
    pattern: "pout",
    desc: "Send a pout reaction GIF.",
    category: "fun",
    react: "😤",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} pouted at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} pouted at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("pout");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .pout command:", error);
        reply(`❌ *Error in .pout command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BLOWKISS COMMAND ====================
cmd({
    pattern: "blowkiss",
    desc: "Send a blowkiss reaction GIF.",
    category: "fun",
    react: "😘",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} blew a kiss to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} blew kisses to everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("blowkiss");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .blowkiss command:", error);
        reply(`❌ *Error in .blowkiss command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HANDHOLD COMMAND ====================
cmd({
    pattern: "handhold",
    desc: "Send a handhold reaction GIF.",
    category: "fun",
    react: "🤝",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is holding hands with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} wants to hold hands with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("handhold");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .handhold command:", error);
        reply(`❌ *Error in .handhold command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SALUTE COMMAND ====================
cmd({
    pattern: "salute",
    desc: "Send a salute reaction GIF.",
    category: "fun",
    react: "🫡",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} saluted @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} saluted everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("salute");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .salute command:", error);
        reply(`❌ *Error in .salute command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== THUMBSUP COMMAND ====================
cmd({
    pattern: "thumbsup",
    desc: "Send a thumbsup reaction GIF.",
    category: "fun",
    react: "👍",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} gave a thumbs up to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} gave a thumbs up to everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("thumbsup");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .thumbsup command:", error);
        reply(`❌ *Error in .thumbsup command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== LAUGH COMMAND ====================
cmd({
    pattern: "laugh",
    desc: "Send a laugh reaction GIF.",
    category: "fun",
    react: "😂",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} laughed at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is laughing at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("laugh");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .laugh command:", error);
        reply(`❌ *Error in .laugh command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== TABLEFLIP COMMAND ====================
cmd({
    pattern: "tableflip",
    desc: "Send a tableflip reaction GIF.",
    category: "fun",
    react: "😶",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} flipped a table on @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} flipped a table on everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("tableflip");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .tableflip command:", error);
        reply(`❌ *Error in .tableflip command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== YES COMMAND ====================
cmd({
    pattern: "yes",
    desc: "Send a yes reaction GIF.",
    category: "fun",
    react: "✅",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} agreed with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} agreed with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nod");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .yes command:", error);
        reply(`❌ *Error in .yes command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NO COMMAND ====================
cmd({
    pattern: "no",
    desc: "Send a no reaction GIF.",
    category: "fun",
    react: "❌",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} said no to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} said no to everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nope");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .no command:", error);
        reply(`❌ *Error in .no command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== STOP COMMAND ====================
cmd({
    pattern: "stop",
    desc: "Send a stop reaction GIF.",
    category: "fun",
    react: "🛑",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} stopped @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} stopped everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("nope");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .stop command:", error);
        reply(`❌ *Error in .stop command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SORRY COMMAND ====================
cmd({
    pattern: "sorry",
    desc: "Send a sorry reaction GIF.",
    category: "fun",
    react: "🙏",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} apologized to @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} apologized to everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("cry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .sorry command:", error);
        reply(`❌ *Error in .sorry command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SAD COMMAND ====================
cmd({
    pattern: "sad",
    desc: "Send a sad reaction GIF.",
    category: "fun",
    react: "😔",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is sad with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is sad!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("cry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .sad command:", error);
        reply(`❌ *Error in .sad command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SCARED COMMAND ====================
cmd({
    pattern: "scared",
    desc: "Send a scared reaction GIF.",
    category: "fun",
    react: "😨",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is scared of @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is scared!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shocked");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .scared command:", error);
        reply(`❌ *Error in .scared command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SURPRISED COMMAND ====================
cmd({
    pattern: "surprised",
    desc: "Send a surprised reaction GIF.",
    category: "fun",
    react: "😲",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is surprised by @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is surprised!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shocked");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .surprised command:", error);
        reply(`❌ *Error in .surprised command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== TIRED COMMAND ====================
cmd({
    pattern: "tired",
    desc: "Send a tired reaction GIF.",
    category: "fun",
    react: "😩",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is tired of @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is tired!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("yawn");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .tired command:", error);
        reply(`❌ *Error in .tired command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SIGH COMMAND ====================
cmd({
    pattern: "sigh",
    desc: "Send a sigh reaction GIF.",
    category: "fun",
    react: "😮‍💨",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} sighed at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} sighed at everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("bored");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .sigh command:", error);
        reply(`❌ *Error in .sigh command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== SHY COMMAND ====================
cmd({
    pattern: "shy",
    desc: "Send a shy reaction GIF.",
    category: "fun",
    react: "😳",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is shy with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is feeling shy!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("blush");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .shy command:", error);
        reply(`❌ *Error in .shy command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NUZZLE COMMAND ====================
cmd({
    pattern: "nuzzle",
    desc: "Send a nuzzle reaction GIF.",
    category: "fun",
    react: "🥰",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} nuzzled @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is nuzzling everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("cuddle");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nuzzle command:", error);
        reply(`❌ *Error in .nuzzle command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== COOL COMMAND ====================
cmd({
    pattern: "cool",
    desc: "Send a cool reaction GIF.",
    category: "fun",
    react: "😎",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is cool with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is cool with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("smug");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .cool command:", error);
        reply(`❌ *Error in .cool command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CELEBRATE COMMAND ====================
cmd({
    pattern: "celebrate",
    desc: "Send a celebrate reaction GIF.",
    category: "fun",
    react: "🎉",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} celebrates with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is celebrating with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("happy");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .celebrate command:", error);
        reply(`❌ *Error in .celebrate command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== YAY COMMAND ====================
cmd({
    pattern: "yay",
    desc: "Send a yay reaction GIF.",
    category: "fun",
    react: "🎊",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is happy with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is celebrating with everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("happy");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .yay command:", error);
        reply(`❌ *Error in .yay command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== HEADBANG COMMAND ====================
cmd({
    pattern: "headbang",
    desc: "Send a headbang reaction GIF.",
    category: "fun",
    react: "🤘",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} headbangs with @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is headbanging!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("dance");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .headbang command:", error);
        reply(`❌ *Error in .headbang command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== NOSEBLEED COMMAND ====================
cmd({
    pattern: "nosebleed",
    desc: "Send a nosebleed reaction GIF.",
    category: "fun",
    react: "🩸",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} nosebleeds at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is nosebleeding!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("shocked");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .nosebleed command:", error);
        reply(`❌ *Error in .nosebleed command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== BULLY COMMAND ====================
cmd({
    pattern: "bully",
    desc: "Send a bully reaction GIF.",
    category: "fun",
    react: "😈",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} is bullying @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is bullying everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("angry");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .bully command:", error);
        reply(`❌ *Error in .bully command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== CRINGE COMMAND ====================
cmd({
    pattern: "cringe",
    desc: "Send a cringe reaction GIF.",
    category: "fun",
    react: "😬",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} thinks @${mentionedUser.split("@")[0]} is cringe`
            : isGroup
            ? `${sender} finds everyone cringe`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("facepalm");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .cringe command:", error);
        reply(`❌ *Error in .cringe command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== KILL COMMAND ====================
cmd({
    pattern: "kill",
    desc: "Send a kill reaction GIF.",
    category: "fun",
    react: "🔪",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} killed @${mentionedUser.split("@")[0]} 💀`
            : isGroup
            ? `${sender} killed everyone! 💀`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("slap");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .kill command:", error);
        reply(`❌ *Error in .kill command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== AWOO COMMAND ====================
cmd({
    pattern: "awoo",
    desc: "Send an awoo reaction GIF.",
    category: "fun",
    react: "🐺",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} awoos at @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is awooing everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("run");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .awoo command:", error);
        reply(`❌ *Error in .awoo command:*\n\`\`\`${error.message}\`\`\``);
    }
});

// ==================== GLOMP COMMAND ====================
cmd({
    pattern: "glomp",
    desc: "Send a glomp reaction GIF.",
    category: "fun",
    react: "🤗",
    filename: __filename,
    use: "@tag (optional)",
}, async (conn, mek, m, { args, q, reply }) => {
    try {
        let sender = `@${mek.sender.split("@")[0]}`;
        let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
        let isGroup = m.isGroup;

        let message = mentionedUser
            ? `${sender} glomped @${mentionedUser.split("@")[0]}`
            : isGroup
            ? `${sender} is glomping everyone!`
            : `> © Powered By JawadTechX 🖤`;

        let url = await getGifX("hug");
        let gifBuffer = (await axios.get(url, { responseType: 'arraybuffer', timeout: 15000 })).data;
        let videoBuffer = await gifToVideo(Buffer.from(gifBuffer));

        await conn.sendMessage(
            mek.chat,
            { video: videoBuffer, caption: message, gifPlayback: true, mentions: [mek.sender, mentionedUser].filter(Boolean) },
            { quoted: mek }
        );
    } catch (error) {
        console.error("❌ Error in .glomp command:", error);
        reply(`❌ *Error in .glomp command:*\n\`\`\`${error.message}\`\`\``);
    }
});
