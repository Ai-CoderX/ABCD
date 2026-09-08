//---------------------------------------------------------------------------
//           JAWAD-MD - TWITTER DOWNLOADER
//---------------------------------------------------------------------------
//  🚀 DOWNLOAD TWITTER/X VIDEOS
//---------------------------------------------------------------------------

import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);

// ============================================
// COMMAND: twitter (Twitter/X Video Downloader)
// ============================================
cmd({
    pattern: "twitter",
    alias: ["tw"],
    desc: "Download Twitter/X videos",
    category: "download",
    react: "🐦",
    filename: __filename
}, async (conn, mek, m, { from, text, reply }) => {
    try {
        if (!text) return reply("🐦 Please provide a Twitter/X URL!\n\nExample: `.twitter https://x.com/username/status/123456789`");

        // Validate URL
        if (!text.includes("twitter.com") && !text.includes("x.com")) {
            return reply("❌ Please provide a valid Twitter/X URL!");
        }

        // Send processing message
        await conn.sendMessage(from, {
            react: { text: '⏳', key: m.key }
        });

        // Clean URL and encode
        const cleanUrl = text.trim();
        const encodedUrl = encodeURIComponent(cleanUrl);
        const apiUrl = `https://api.deline.web.id/downloader/twitter?url=${encodedUrl}`;

        // Fetch from API
        const response = await axios.get(apiUrl, { 
            timeout: 30000,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.data?.status) {
            return reply("❌ Failed to fetch video! Please check the URL and try again.");
        }

        const data = response.data.data;
        
        if (!data.downloadLink) {
            return reply("❌ No video found for this tweet!");
        }

        // Send video info
        const caption = `╭┈───〔 Twitter Downloader 〕┈───⊷
├▢ 🐦 Title: ${data.videoTitle || 'Twitter Video'}
├▢ 📝 Description: ${data.videoDescription || 'N/A'}
├▢ 📥 Status: Downloading...
╰───────────────────⊷

> Powered by KHAN-MD`;

        await conn.sendMessage(from, {
            image: { url: data.imgUrl },
            caption: caption
        }, { quoted: mek });

        // Send the video
        await conn.sendMessage(from, {
            video: { url: data.downloadLink },
            caption: `🐦 *${data.videoTitle || 'Twitter Video'}*\n\n> Powered by KHAN-MD`,
            mimetype: "video/mp4"
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("❌ TWITTER ERROR:", error);
        
        if (error.code === 'ECONNABORTED') {
            reply("⏰ Request timeout! Please try again later.");
        } else if (error.response?.status === 404) {
            reply("❌ Video not found! Please check the URL.");
        } else {
            reply(`❌ Error occurred: ${error.message}`);
        }
        
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});
