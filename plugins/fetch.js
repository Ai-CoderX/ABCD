// plugins/fetch.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

cmd({
    pattern: "fetch",
    alias: ["get", "api"],
    desc: "Fetch data from a provided URL or API",
    category: "main",
    react: "🌐",
    filename: __filename
}, async (conn, mek, m, { from, args, reply }) => {
    try {
        const q = args.join(' ').trim();
        if (!q) return reply('❌ Please provide a valid URL or query.');

        if (!/^https?:\/\//.test(q)) return reply('❌ URL must start with http:// or https://.');

        // Make request using axios directly
        const response = await axios({
            method: 'get',
            url: q,
            responseType: 'arraybuffer', // Get raw response to detect content type
            timeout: 30000 // 30 second timeout
        });

        // Get content type from response headers
        const contentType = response.headers['content-type'] || '';
        
        // Handle different response types
        if (contentType.includes('application/json')) {
            // Parse JSON data
            const jsonData = JSON.parse(response.data.toString());
            const jsonString = JSON.stringify(jsonData, null, 2);
            
            // If JSON is too long, send as file
            if (jsonString.length > 2000) {
                const buffer = Buffer.from(jsonString);
                await conn.sendMessage(from, {
                    document: buffer,
                    mimetype: 'application/json',
                    fileName: 'response.json',
                    caption: `📄 *JSON Response*\nSize: ${jsonString.length} characters`
                }, { quoted: mek });
            } else {
                // Send as normal text
                await conn.sendMessage(from, {
                    text: `🔍 *Fetched JSON Data*:\n\`\`\`${jsonString}\`\`\``
                }, { quoted: mek });
            }
        }
        else if (contentType.includes('image/')) {
            // Send as image
            await conn.sendMessage(from, {
                image: Buffer.from(response.data),
                caption: `🖼️ *Image Response*\nContent-Type: ${contentType}`
            }, { quoted: mek });
        }
        else if (contentType.includes('video/')) {
            // Send as video
            await conn.sendMessage(from, {
                video: Buffer.from(response.data),
                caption: `🎥 *Video Response*\nContent-Type: ${contentType}`
            }, { quoted: mek });
        }
        else if (contentType.includes('audio/')) {
            // Send as audio
            await conn.sendMessage(from, {
                audio: Buffer.from(response.data),
                mimetype: contentType,
                caption: `🎵 *Audio Response*\nContent-Type: ${contentType}`
            }, { quoted: mek });
        }
        else if (contentType.includes('text/')) {
            // Send as text
            const textData = response.data.toString();
            if (textData.length > 2000) {
                // If text is too long, send as file
                const buffer = Buffer.from(textData);
                await conn.sendMessage(from, {
                    document: buffer,
                    mimetype: 'text/plain',
                    fileName: 'response.txt',
                    caption: `📄 *Text Response*\nSize: ${textData.length} characters`
                }, { quoted: mek });
            } else {
                await conn.sendMessage(from, {
                    text: `📝 *Text Response*:\n${textData}`
                }, { quoted: mek });
            }
        }
        else {
            // Handle other content types or send as document
            const buffer = Buffer.from(response.data);
            const ext = contentType.split('/')[1] || 'bin';
            await conn.sendMessage(from, {
                document: buffer,
                mimetype: contentType,
                fileName: `response.${ext}`,
                caption: `📁 *Response*\nContent-Type: ${contentType}\nSize: ${buffer.length} bytes`
            }, { quoted: mek });
        }

    } catch (e) {
        console.error("Error in fetch command:", e);
        
        let errorMessage = `❌ An error occurred:\n`;
        if (e.response) {
            errorMessage += `Status: ${e.response.status}\n`;
            errorMessage += `Message: ${e.response.statusText || e.message}`;
        } else if (e.request) {
            errorMessage += `No response received from server\n`;
            errorMessage += `Error: ${e.message}`;
        } else {
            errorMessage += e.message;
        }
        
        reply(errorMessage);
    }
});

//==================== ADVANCED GLOW ====================
cmd({
    pattern: "advglow",
    alias: ["advancedglow", "glow1"],
    desc: "Advanced glow text effect",
    category: "logo",
    react: "✨",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Advanced Glow*\n\nUsage: .advglow <text>\nExample: .advglow JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/advancedglow?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Advanced Glow` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== AMONG US ====================
cmd({
    pattern: "amongus",
    alias: ["amongustext", "among"],
    desc: "Among Us style text",
    category: "logo",
    react: "🎮",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Among Us Text*\n\nUsage: .amongus <text>\nExample: .amongus JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/amongustext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Among Us` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== BLACKPINK LOGO ====================
cmd({
    pattern: "bplogo",
    alias: ["blackpinklogo", "bp"],
    desc: "Blackpink logo style",
    category: "logo",
    react: "🖤",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Blackpink Logo*\n\nUsage: .bplogo <text>\nExample: .bplogo JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/blackpinklogo?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Blackpink Logo` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== BLACKPINK STYLE ====================
cmd({
    pattern: "bpstyle",
    alias: ["blackpinkstyle", "bpstyle1"],
    desc: "Blackpink text style",
    category: "logo",
    react: "💗",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Blackpink Style*\n\nUsage: .bpstyle <text>\nExample: .bpstyle JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/blackpinkstyle?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Blackpink Style` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== CARTOON STYLE ====================
cmd({
    pattern: "cartoon",
    alias: ["cartoonstyle", "cartoontxt"],
    desc: "Cartoon text style",
    category: "logo",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Cartoon Style*\n\nUsage: .cartoon <text>\nExample: .cartoon JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/cartoonstyle?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Cartoon` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== DELETING TEXT ====================
cmd({
    pattern: "deletetxt",
    alias: ["deletingtext", "deltext"],
    desc: "Deleting text effect",
    category: "logo",
    react: "💫",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Deleting Text*\n\nUsage: .deletetxt <text>\nExample: .deletetxt JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/deletingtext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Deleting Text` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== EFFECT CLOUDS ====================
cmd({
    pattern: "clouds",
    alias: ["effectclouds", "cloudtxt"],
    desc: "Clouds text effect",
    category: "logo",
    react: "☁️",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Effect Clouds*\n\nUsage: .clouds <text>\nExample: .clouds JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/effectclouds?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Clouds Effect` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== FLAG 3D TEXT ====================
cmd({
    pattern: "flag3d",
    alias: ["flag3dtext", "3dflag"],
    desc: "Flag 3D text effect",
    category: "logo",
    react: "🚩",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Flag 3D Text*\n\nUsage: .flag3d <text>\nExample: .flag3d JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/flag3dtext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Flag 3D` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== FREE CREATE ====================
cmd({
    pattern: "freecreate",
    alias: ["freecreate1", "fc"],
    desc: "Free create text effect",
    category: "logo",
    react: "🎯",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Free Create*\n\nUsage: .freecreate <text>\nExample: .freecreate JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/freecreate?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Free Create` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GALAXY STYLE ====================
cmd({
    pattern: "galaxy",
    alias: ["galaxystyle", "galaxytxt"],
    desc: "Galaxy text style",
    category: "logo",
    react: "🌌",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Galaxy Style*\n\nUsage: .galaxy <text>\nExample: .galaxy JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/galaxystyle?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Galaxy` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GALAXY WALLPAPER ====================
cmd({
    pattern: "galaxywp",
    alias: ["galaxywallpaper", "gwp"],
    desc: "Galaxy wallpaper text",
    category: "logo",
    react: "🌠",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Galaxy Wallpaper*\n\nUsage: .galaxywp <text>\nExample: .galaxywp JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/galaxywallpaper?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Galaxy Wallpaper` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GLITCH TEXT ====================
cmd({
    pattern: "glitch",
    alias: ["glitchtext", "glitchtxt"],
    desc: "Glitch text effect",
    category: "logo",
    react: "⚡",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Glitch Text*\n\nUsage: .glitch <text>\nExample: .glitch JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/glitchtext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Glitch` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GLOWING TEXT ====================
cmd({
    pattern: "glow",
    alias: ["glowingtext", "glowtxt"],
    desc: "Glowing text effect",
    category: "logo",
    react: "🌟",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Glowing Text*\n\nUsage: .glow <text>\nExample: .glow JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/glowingtext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Glowing Text` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== GRADIENT TEXT ====================
cmd({
    pattern: "gradient",
    alias: ["gradienttext", "gradtxt"],
    desc: "Gradient text effect",
    category: "logo",
    react: "🌈",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Gradient Text*\n\nUsage: .gradient <text>\nExample: .gradient JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/gradienttext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Gradient Text` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== LIGHT EFFECTS ====================
cmd({
    pattern: "lightfx",
    alias: ["lighteffects", "lighteffect"],
    desc: "Light effects text",
    category: "logo",
    react: "💡",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Light Effects*\n\nUsage: .lightfx <text>\nExample: .lightfx JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/lighteffects?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Light Effects` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== LOGO MAKER ====================
cmd({
    pattern: "logomaker",
    alias: ["logomk", "mklogo"],
    desc: "Logo maker text",
    category: "logo",
    react: "🔱",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Logo Maker*\n\nUsage: .logomaker <text>\nExample: .logomaker JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/logomaker?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Logo Maker` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== LUXURY GOLD ====================
cmd({
    pattern: "luxurygold",
    alias: ["gold", "goldtxt"],
    desc: "Luxury gold text",
    category: "logo",
    react: "👑",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Luxury Gold*\n\nUsage: .luxurygold <text>\nExample: .luxurygold JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/luxurygold?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Luxury Gold` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== MAKING NEON ====================
cmd({
    pattern: "neon",
    alias: ["makingneon", "neontxt"],
    desc: "Neon text effect",
    category: "logo",
    react: "💚",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Making Neon*\n\nUsage: .neon <text>\nExample: .neon JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/makingneon?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Neon` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== PAPER CUT STYLE ====================
cmd({
    pattern: "papercut",
    alias: ["papercutstyle", "pcut"],
    desc: "Paper cut text style",
    category: "logo",
    react: "✂️",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Paper Cut Style*\n\nUsage: .papercut <text>\nExample: .papercut JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/papercutstyle?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Paper Cut` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== PIXEL GLITCH ====================
cmd({
    pattern: "pixelglitch",
    alias: ["pixel", "pglitch"],
    desc: "Pixel glitch text effect",
    category: "logo",
    react: "👾",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Pixel Glitch*\n\nUsage: .pixelglitch <text>\nExample: .pixelglitch JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/pixelglitch?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Pixel Glitch` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== ROYAL TEXT ====================
cmd({
    pattern: "royal",
    alias: ["royaltext", "royaltxt"],
    desc: "Royal text style",
    category: "logo",
    react: "🤴",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Royal Text*\n\nUsage: .royal <text>\nExample: .royal JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/royaltext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Royal Text` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== SAND SUMMER ====================
cmd({
    pattern: "sand",
    alias: ["sandsummer", "sandtxt"],
    desc: "Sand summer text effect",
    category: "logo",
    react: "🏖️",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Sand Summer*\n\nUsage: .sand <text>\nExample: .sand JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/sandsummer?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Sand Summer` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== TYPOGRAPHY TEXT ====================
cmd({
    pattern: "typography",
    alias: ["typographytext", "typo"],
    desc: "Typography text effect",
    category: "logo",
    react: "📝",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Typography Text*\n\nUsage: .typography <text>\nExample: .typography JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/typographytext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Typography` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== SUMMER BEACH ====================
cmd({
    pattern: "beach",
    alias: ["summerbeach", "beachtxt"],
    desc: "Summer beach text effect",
    category: "logo",
    react: "🌊",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Summer Beach*\n\nUsage: .beach <text>\nExample: .beach JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/summerbeach?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Summer Beach` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== UNDERWATER TEXT ====================
cmd({
    pattern: "underwater",
    alias: ["underwatertext", "uwtxt"],
    desc: "Underwater text effect",
    category: "logo",
    react: "🐠",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Underwater Text*\n\nUsage: .underwater <text>\nExample: .underwater JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/underwatertext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Underwater` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== WATERCOLOR TEXT ====================
cmd({
    pattern: "watercolor",
    alias: ["watercolortext", "wctxt"],
    desc: "Watercolor text effect",
    category: "logo",
    react: "🎨",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Watercolor Text*\n\nUsage: .watercolor <text>\nExample: .watercolor JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/watercolortext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Watercolor` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});

// ==================== WRITE TEXT ====================
cmd({
    pattern: "write",
    alias: ["writetext", "writetxt"],
    desc: "Write text effect",
    category: "logo",
    react: "✍️",
    filename: __filename,
}, async (conn, mek, m, { from, reply, args }) => {
    try {
        if (!args[0]) return reply("*Write Text*\n\nUsage: .write <text>\nExample: .write JAWAD-MD");
        const text = args.join('+');
        await conn.sendMessage(from, { react: { text: "⏳", key: mek.key } });
        const apiUrl = `https://jerrycoder.oggyapi.workers.dev/ephoto/writetext?text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        if (response.data.status !== 'success') throw new Error('API error');
        const imageResponse = await axios.get(response.data.image, { responseType: 'arraybuffer', timeout: 30000 });
        await conn.sendMessage(from, { image: Buffer.from(imageResponse.data), caption: `*Generated!*\nText: ${args.join(' ')}\nStyle: Write Text` }, { quoted: mek });
        await conn.sendMessage(from, { react: { text: "✅", key: mek.key } });
    } catch (e) {
        await conn.sendMessage(from, { react: { text: "❌", key: mek.key } });
        reply(`❌ Error: ${e.message}`);
    }
});
