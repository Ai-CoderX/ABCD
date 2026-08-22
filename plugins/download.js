// plugins/download.js - ESM Version
import { fileURLToPath } from 'url';
import { cmd } from '../command.js';
import config from '../config.js';
import axios from 'axios';
import yts from 'yt-search';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { File } from 'megajs';
import converter from '../lib/converter.js';

const __filename = fileURLToPath(import.meta.url);

// Helper function to extract video ID
function getVideoId(url) {
    const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    return match ? match[1] : null;
}

cmd({
    pattern: "gdrive",
    alias: ["googledrive", "gdl"],
    desc: "Download files from Google Drive",
    category: "download",
    react: "📁",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) {
            return reply(`📁 *Google Drive Downloader* 📁\n\nDownload files from Google Drive using share link!\n\n*Usage:* .gdrive <google_drive_link>\n*Example:* .gdrive https://drive.google.com/file/d/xxxxx/view`);
        }

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });

        // Extract file ID from Google Drive URL
        let fileId = null;
        const patterns = [
            /\/file\/d\/([^\/]+)/,
            /id=([^&]+)/,
            /\/d\/([^\/]+)/,
            /\/uc\?id=([^&]+)/
        ];
        
        for (const pattern of patterns) {
            const match = q.match(pattern);
            if (match) {
                fileId = match[1];
                break;
            }
        }

        if (!fileId) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Invalid Google Drive link. Please provide a valid share link.");
        }

        const apiUrl = `https://api.deline.web.id/downloader/gdrive?url=https://drive.google.com/file/d/${fileId}/view`;
        const response = await axios.get(apiUrl);

        if (!response.data.status || !response.data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Failed to fetch file from Google Drive. Please try again.");
        }

        const result = response.data.result;
        const downloadUrl = result.downloadUrl;
        const fileName = result.fileName;
        const fileSize = result.fileSize;
        const mimetype = result.mimetype;

        if (!downloadUrl) {
            await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
            return reply("❌ Failed to get download URL. Please try again.");
        }

        // Download the file
        const fileResponse = await axios({
            method: 'GET',
            url: downloadUrl,
            responseType: 'arraybuffer'
        });

        const fileBuffer = Buffer.from(fileResponse.data);

        // Send the file
        await conn.sendMessage(from, {
            document: fileBuffer,
            fileName: fileName,
            mimetype: mimetype || 'application/octet-stream',
            caption: `📁 *${fileName}*\n📦 *Size:* ${fileSize}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });

    } catch (error) {
        console.error("Google Drive Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
        reply("❌ An error occurred while downloading the file. Please try again.");
    }
});

// ==================== CAPCUT COMMAND ====================
cmd({
    pattern: "capcut",
    desc: "Download CapCut templates",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎬 *Please provide a CapCut template link*");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await reply("*⏳ Fetching CapCut template, please wait...*");

        const apiUrl = `https://api.deline.web.id/downloader/capcut?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || data.result.error) return await reply("❌ Failed to fetch CapCut template.");

        const result = data.result;
        const media = result.medias.find(v => v.quality === "No Watermark") || result.medias[0];

        const caption = `🎬 *CapCut Template Downloaded*

📌 *Title:* ${result.title}
👤 *Author:* ${result.author}
⏱ *Duration:* ${Math.floor(result.duration / 1000)}s
🎞 *Quality:* ${media.quality}

> ${DESCRIPTION}`;

        await conn.sendMessage(from, { video: { url: media.url }, caption }, { quoted: mek });

    } catch (err) {
        console.error("CAPCUT ERROR:", err);
        await reply("❌ Error downloading CapCut template. Try again later.");
    }
});

// ==================== APK COMMAND ====================
cmd({
    pattern: "apk",
    alias: ["app", "dlapk"],
    react: "🚀",
    desc: "📥 Download APK directly from Aptoide",
    category: "download",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("❌ *Please provide an app name!*");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `http://ws75.aptoide.com/api/7/apps/search/query=${encodeURIComponent(q)}/limit=1`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data || !data.datalist || !data.datalist.list || data.datalist.list.length === 0) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App not found. Please try another name.*");
        }

        const app = data.datalist.list[0];
        const sizeInMB = (app.size / (1024 * 1024)).toFixed(2);
        
        if (app.size > 150 * 1024 * 1024) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ *App size is too large to download (max 150MB)*");
        }
        
        const caption = `✅ *APK Downloaded Successfully*\n\n📱 *App:* ${app.name}\n📦 *Size:* ${sizeInMB} MB\n\n> ${DESCRIPTION}`;

        await conn.sendMessage(from, {
            document: { url: app.file.path_alt },
            mimetype: "application/vnd.android.package-archive",
            fileName: `${app.name}.apk`,
            caption: caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("APK Download Error:", error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ *An error occurred while fetching the APK. Please try again later.*");
    }
});

// ==================== FACEBOOK COMMAND ====================
cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl"],
    react: '📥',
    desc: "Download videos from Facebook (API v4)",
    category: "download",
    use: ".fb <Facebook video URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, userConfig }) => {
    try {
        const fbUrl = args[0];
        if (!fbUrl || !fbUrl.includes("facebook.com")) {
            return reply('❌ Please provide a valid Facebook video URL.\n\nExample:\n.fb https://facebook.com/...');
        }

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(fbUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.result || !Array.isArray(data.result)) {
            return reply('❌ Unable to fetch the video. Please check the URL and try again.');
        }

        const hd = data.result.find(v => v.quality === "HD");
        const sd = data.result.find(v => v.quality === "SD");
        const video = hd || sd;

        if (!video) return reply("❌ Video not found in the response.");

        await reply(`Downloading video Please wait`);

        await conn.sendMessage(from, {
            video: { url: video.url },
            caption: `🎥 *Facebook Video Downloader*\n\n> Quality: ${video.quality}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('FB Error:', error);
        reply('❌ Failed to download the video. Please try again later.');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== INSTAGRAM COMMANDS ====================
cmd({
    pattern: "igdl",
    alias: ["instagram", "insta", "ig"],
    react: "⬇️",
    desc: "Download Instagram videos/reels",
    category: "download",
    use: ".igdl <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, userConfig }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) return reply("❌ Please provide/reply to an Instagram link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data.data?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch media. Invalid link or private content.");
        }

        for (const item of response.data.data) {
            await conn.sendMessage(from, {
                [item.type === 'video' ? 'video' : 'image']: { url: item.url },
                caption: `📶 *Instagram Downloader*\n\n- ❤‍🩹 *Quality*: HD\n\n> ${DESCRIPTION}`
            }, { quoted: mek });
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGDL Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Download failed. Try again later.");
    }
});

cmd({
    pattern: "igdl2",
    alias: ["instagram2", "ig2", "instadl2"],
    react: '📥',
    desc: "Download videos from Instagram (API v5)",
    category: "download",
    use: ".igdl2 <Instagram video URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, userConfig }) => {
    try {
        const igUrl = args[0];
        if (!igUrl || !igUrl.includes("instagram.com")) {
            return reply('❌ Please provide a valid Instagram video URL.\n\nExample:\n.igdl2 https://instagram.com/reel/...');
        }

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(igUrl)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data.status || !data.result || !Array.isArray(data.result)) {
            return reply('❌ Unable to fetch the video. Please check the URL and try again.');
        }

        const videoUrl = data.result[0];
        if (!videoUrl) return reply("❌ No video found in the response.");

        const metadata = data.metadata || {};
        const author = metadata.author || "Unknown";
        const caption = metadata.caption ? metadata.caption.slice(0, 300) + "..." : "No caption provided.";
        const likes = metadata.like || 0;
        const comments = metadata.comment || 0;

        await reply('Downloading Instagram video...Please wait.📥');

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `📥 *Instagram Reel Downloader*\n👤 *Author:* ${author}\n💬 *Caption:* ${caption}\n❤️ *Likes:* ${likes} | 💭 *Comments:* ${comments}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });
    } catch (error) {
        console.error('IGDL2 Error:', error);
        reply('❌ Failed to download the Instagram video. Please try again later.');
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "igdl3",
    alias: ["instagram3", "insta3", "ig3"],
    react: "⬇️",
    desc: "Download Instagram posts, reels, and stories",
    category: "download",
    use: ".igdl3 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, userConfig }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) return reply("❌ Please provide/reply to a valid Instagram link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://jawad-tech.vercel.app/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);

        if (!response.data?.status || !response.data.result?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("❌ Failed to fetch media. Invalid link or private content.");
        }

        const mediaData = response.data.result;

        for (const item of mediaData) {
            const isVideo = item.contentType?.includes('video') || item.format === 'mp4';
            
            if (isVideo) {
                await conn.sendMessage(from, {
                    video: { url: item.url },
                    caption: `📱 *Instagram Downloader*\n\n📹 *Type*: Video\n💾 *Size*: ${(item.size / 1024 / 1024).toFixed(2)} MB\n🎞️ *Format*: ${item.format}\n\n> ${DESCRIPTION}`
                }, { quoted: mek });
            } else {
                await conn.sendMessage(from, {
                    image: { url: item.url },
                    caption: `📱 *Instagram Downloader*\n\n🖼️ *Type*: Image\n💾 *Size*: ${(item.size / 1024).toFixed(2)} KB\n🎨 *Format*: ${item.format}\n\n> ${DESCRIPTION}`
                }, { quoted: mek });
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGDL3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Download failed. Please check the link and try again.");
    }
});

// ==================== MEDIAFIRE COMMAND ====================
cmd({
    pattern: "mediafire",
    alias: ["mfire", "mfdownload"],
    react: '📥',
    desc: "Download any file from MediaFire (supports .mp4, .apk, .zip, .js, documents, etc.)",
    category: "download",
    use: ".mediafire <MediaFire URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, args, userConfig }) => {
    try {
        const url = args.join(" ");
        if (!url || !url.includes("mediafire.com")) {
            return reply("❌ Please provide a valid MediaFire URL\nExample: .mediafire https://www.mediafire.com/file/...");
        }

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api.deline.web.id/downloader/mediafire?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl);

        if (!data || !data.status || !data.result || !data.result.downloadUrl || !data.result.fileName) {
            return reply("❌ Failed to fetch file info. Invalid URL or API error.");
        }

        const fileName = data.result.fileName;
        const downloadUrl = data.result.downloadUrl;

        const fileResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
        const fileBuffer = Buffer.from(fileResponse.data);

        const ext = fileName.split('.').pop().toLowerCase();
        let mimetype = 'application/octet-stream';
        if (ext === 'mp4') mimetype = 'video/mp4';
        else if (ext === 'apk') mimetype = 'application/vnd.android.package-archive';
        else if (ext === 'zip') mimetype = 'application/zip';
        else if (ext === 'js') mimetype = 'text/javascript';

        await conn.sendMessage(from, {
            document: fileBuffer,
            fileName: fileName,
            mimetype: mimetype,
            caption: `*MediaFire Download*\n\n📄 *File:* ${fileName}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });
        
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("MediaFire Error:", error);
        reply("❌ Failed to download file. Please check the URL or try again later.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== NPM DOWNLOAD COMMAND ====================
cmd({
    pattern: "dlnpm",
    desc: "Download npm package as tgz (supports scoped packages)",
    category: "download",
    react: "📦",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("❌ *Please provide a package name*");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        const pkg = q.trim();
        const encodedPkg = encodeURIComponent(pkg);
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

        const infoUrl = `https://registry.npmjs.org/${encodedPkg}`;
        const infoRes = await axios.get(infoUrl).catch(() => null);

        if (!infoRes || !infoRes.data) {
            return reply("❌ Package not found in NPM registry");
        }

        const data = infoRes.data;
        const latest = data['dist-tags'].latest;
        const tarballUrl = data.versions[latest].dist.tarball;

        const safeName = pkg.replace('@', '').replace('/', '-');
        const fileName = `${safeName}-${latest}.tgz`;
        const filePath = path.join(tempDir, fileName);

        const tarballRes = await axios.get(tarballUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filePath, tarballRes.data);

        await conn.sendMessage(from, {
            document: fs.readFileSync(filePath),
            mimetype: 'application/gzip',
            fileName: fileName,
            caption: `📦 *NPM Package Downloaded*\n\n• *Name:* ${pkg}\n• *Version:* ${latest}\n• *Format:* .tgz\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        fs.unlinkSync(filePath);

    } catch (err) {
        console.error("DLNPM Error:", err);
        reply("❌ NPM package download failed");
    }
});

// ==================== MEGA DOWNLOAD COMMAND ====================
cmd({
    pattern: "megadl",
    alias: ["mega", "meganz"],
    react: "📦",
    desc: "Download ZIP or any file from Mega.nz",
    category: "download",
    use: '.megadl <mega file link>',
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("📦 Please provide a Mega.nz file link.\n\nExample: `.megadl https://mega.nz/file/xxxx#key`");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const file = File.fromURL(q);
        const data = await new Promise((resolve, reject) => {
            file.download((err, data) => {
                if (err) reject(err);
                else resolve(data);
            });
        });

        const savePath = path.join(os.tmpdir(), file.name || "mega_file.zip");
        fs.writeFileSync(savePath, data);

        await conn.sendMessage(from, {
            document: fs.readFileSync(savePath),
            fileName: file.name || "JawadTechX.zip",
            mimetype: "application/zip",
            caption: `📦 Downloaded from Mega NZ\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        fs.unlinkSync(savePath);
        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("❌ MEGA Downloader Error:", error);
        reply("❌ Failed to download file from Mega.nz. Make sure the link is valid and file is accessible.");
    }
});

// ==================== TIKTOK MP3 COMMAND ====================
cmd({
    pattern: "ttmp3",
    alias: ["tiktokmp3", "tiktokaudio", "ttaudio"],
    react: "🎵",
    desc: "Extract audio from TikTok video",
    category: "download",
    use: ".ttmp3 <TikTok URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, userConfig }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("tiktok.com")) return reply("❌ Please provide/reply to a TikTok link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api.deline.web.id/downloader/tiktok?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;
        
        if (!data.status || !data.result) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch TikTok video.");
        }

        const videoUrl = data.result.download;
        
        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: `> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('TTMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});

// ==================== INSTAGRAM MP3 COMMAND ====================
cmd({
    pattern: "igmp3",
    alias: ["instamp3", "instaaudio", "igaudio"],
    react: "🎵",
    desc: "Extract audio from Instagram video/reel",
    category: "download",
    use: ".igmp3 <Instagram URL>",
    filename: __filename
}, async (conn, mek, m, { from, reply, q, userConfig }) => {
    try {
        const url = q || m.quoted?.text;
        if (!url || !url.includes("instagram.com")) return reply("❌ Please provide/reply to an Instagram link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
        const response = await axios.get(apiUrl);
        const data = response.data;

        if (!data?.status || !data.data?.length) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("Failed to fetch media.");
        }

        const videoItem = data.data.find(item => item.type === 'video');
        if (!videoItem) {
            await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
            return reply("No video found.");
        }

        await conn.sendMessage(from, { react: { text: '⬇️', key: m.key } });
        const videoResponse = await axios.get(videoItem.url, { responseType: 'arraybuffer' });
        const videoBuffer = Buffer.from(videoResponse.data);
        
        await conn.sendMessage(from, { react: { text: '🔧', key: m.key } });
        const audioBuffer = await converter.toAudio(videoBuffer, 'mp4');
        
        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: false,
            caption: `> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error('IGMP3 Error:', error);
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
        reply("❌ Audio extraction failed. Error: " + error.message);
    }
});

// ==================== TIKTOK VIDEO COMMANDS ====================
cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl"],
    desc: "Download TikTok video using multiple APIs",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let videoUrl, title, author, username;

        try {
            const api1 = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
            const res1 = await axios.get(api1);
            const data1 = res1.data;

            if (data1?.status && data1?.result) {
                videoUrl = data1.result;
                title = data1.metadata?.title || "Unknown Title";
                author = data1.metadata?.author || "Unknown Author";
                username = data1.metadata?.username || "unknown";
            } else {
                throw new Error("First API failed");
            }
        } catch (api1Error) {
            try {
                const api2 = `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(q)}`;
                const res2 = await axios.get(api2);
                const data2 = res2.data;

                if (data2?.status && data2?.result) {
                    videoUrl = data2.result;
                    title = data2.metadata?.title || "Unknown Title";
                    author = data2.metadata?.author?.nickname || data2.metadata?.author || "Unknown Author";
                    username = data2.metadata?.author?.username?.replace('@', '') || "unknown";
                } else {
                    throw new Error("Second API also failed");
                }
            } catch (api2Error) {
                return await reply("❌ Both APIs failed! Try again later.");
            }
        }

        if (!videoUrl) return await reply("❌ Download failed! No video URL found.");

        await conn.sendMessage(from, {
            video: { url: videoUrl },
            mimetype: 'video/mp4',
            caption: `🎵 ${title}\n👤 *Author:* ${author}\n⚡ *Username:* @${username}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "tiktok2",
    alias: ["tt2", "ttdl2"],
    desc: "Download TikTok video using JawadTech API",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt2 link");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const api = `https://jawad-tech.vercel.app/download/tiktok?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        const meta = json.metadata;

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption: `🎵 *${meta.title}*\n👤 *Author:* ${meta.author}\n📱 *Username:* @${meta.username}\n🌍 *Region:* ${meta.region}\n\n> ${DESCRIPTION}`
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok2:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

cmd({
    pattern: "tiktok3",
    alias: ["tt3", "ttdl3"],
    desc: "Download HD TikTok videos using JawadTechXD API",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return await reply("🎯 Please provide a valid TikTok link!\n\nExample:\n.tt3 link ");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        const api = `https://jawad-tech.vercel.app/download/ttdl?url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const json = res.data;

        if (!json?.status || !json?.result) return await reply("❌ Download failed! Try again later.");

        const meta = json.metadata;

        const caption = `
🎬 *${meta.title}*

👤 *Author:* ${meta.author.nickname} (${meta.author.username})
🎵 *Music:* ${meta.music.title}
💿 *By:* ${meta.music.author}

📊 *Stats:*
   • Views: ${meta.stats.views}
   • Likes: ${meta.stats.likes}
   • Shares: ${meta.stats.shares}
   • Comments: ${meta.stats.comments}
   • Downloads: ${meta.stats.downloads}

🌍 *Region:* ${meta.region}
🕒 *Duration:* ${meta.duration}s
📅 *Published:* ${meta.published}

> ${DESCRIPTION}
        `.trim();

        await conn.sendMessage(from, {
            video: { url: json.result },
            mimetype: 'video/mp4',
            caption
        }, { quoted: mek });

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error("Error in .tiktok3:", e);
        await reply("❌ Error occurred while downloading TikTok video!");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

// ==================== YOUTUBE POST COMMAND ====================
cmd({
    pattern: "ytpost",
    alias: ["ytcommunity", "ytc"],
    desc: "Download a YouTube community post",
    category: "download",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) return reply("Please provide a YouTube community post URL.\nExample: `.ytpost <url>`");

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        const apiUrl = `https://api.siputzx.my.id/api/d/ytpost?url=${encodeURIComponent(q)}`;
        const { data } = await axios.get(apiUrl);

        if (!data.status || !data.data) {
            return reply("Failed to fetch the community post. Please check the URL.");
        }

        const post = data.data;
        let caption = `📢 *YouTube Community Post* 📢\n\n📜 *Content:* ${post.content}\n\n> ${DESCRIPTION}`;

        if (post.images && post.images.length > 0) {
            for (const img of post.images) {
                await conn.sendMessage(from, { image: { url: img }, caption }, { quoted: mek });
                caption = "";
            }
        } else {
            await conn.sendMessage(from, { text: caption }, { quoted: mek });
        }

    } catch (e) {
        console.error("Error in ytpost command:", e);
        reply("An error occurred while fetching the YouTube community post.");
    }
});

// ==================== UNIVERSAL DOWNLOAD COMMAND ====================
const platforms = {
    youtube: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w\-_]{11})/i,
        api: "https://jawad-tech.vercel.app/download/ytdl",
    },
    facebook: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(facebook\.com|fb\.watch)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/downloader",
    },
    instagram: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(instagram\.com|instagr\.am)\/[^\s]+/i,
        api: "https://api-aswin-sparky.koyeb.app/api/downloader/igdl",
    },
    pinterest: {
        pattern: /(?:https?:\/\/)?(?:www\.)?(pinterest\.com|pin\.it)\/[^\s]+/i,
        api: "https://jawad-tech.vercel.app/download/pinterest",
    }
};

cmd({
    pattern: "download",
    alias: ["down", "dl", "downurl"],
    desc: "Download from any URL (Social Media, Images, Videos, Audio, Documents)",
    category: "download",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, q, reply, userConfig }) => {
    try {
        if (!q) {
            return await reply("❌ Please provide a URL to download!\n\nExample:\n.download https://youtu.be/xxxx\n.download https://instagram.com/p/xxxx\n.download https://example.com/image.jpg\n.download https://example.com/song.mp3");
        }

        // Get DESCRIPTION from userConfig if available, otherwise use config.DESCRIPTION
        const DESCRIPTION = userConfig?.DESCRIPTION || config.DESCRIPTION || "";

        await conn.sendMessage(from, { react: { text: '⏳', key: m.key } });

        let matchedPlatform = null;
        for (const [platform, data] of Object.entries(platforms)) {
            if (q.match(data.pattern)) {
                matchedPlatform = platform;
                break;
            }
        }

        if (matchedPlatform) {
            await handleSocialDownload(conn, from, q, matchedPlatform, m, DESCRIPTION);
        } else {
            await handleDirectDownload(conn, from, q, m, DESCRIPTION);
        }

        await conn.sendMessage(from, { react: { text: '✅', key: m.key } });

    } catch (error) {
        console.error("Download error:", error);
        await reply("❌ Failed to download. Please check the URL and try again.");
        await conn.sendMessage(from, { react: { text: '❌', key: m.key } });
    }
});

async function handleSocialDownload(conn, from, url, platformType, message, DESCRIPTION) {
    try {
        switch (platformType) {
            case "instagram":
                await downloadInstagram(conn, from, url, message, DESCRIPTION);
                break;
            case "youtube":
                await downloadYouTube(conn, from, url, message, DESCRIPTION);
                break;
            case "facebook":
                await downloadFacebook(conn, from, url, message, DESCRIPTION);
                break;
            case "pinterest":
                await downloadPinterest(conn, from, url, message, DESCRIPTION);
                break;
            default:
                throw new Error("Unsupported platform");
        }
    } catch (error) {
        console.error(`Social download error for ${platformType}:`, error);
        throw error;
    }
}

async function downloadInstagram(conn, from, url, message, DESCRIPTION) {
    const apiUrl = `https://api-aswin-sparky.koyeb.app/api/downloader/igdl?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data?.status || !response.data.data?.length) {
        throw new Error("Failed to fetch Instagram media");
    }
    
    const mediaData = response.data.data;
    let sentCount = 0;

    for (const item of mediaData) {
        const mediaType = item.type === 'video' ? 'video' : 'image';
        
        await conn.sendMessage(from, {
            [mediaType]: { url: item.url },
            caption: sentCount === 0 ? `> ${DESCRIPTION}` : undefined
        }, { quoted: message });
        
        sentCount++;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

async function downloadYouTube(conn, from, url, message, DESCRIPTION) {
    const apiUrl = `https://jawad-tech.vercel.app/download/ytdl?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data?.status || !response.data.result?.mp4) {
        throw new Error("Failed to fetch YouTube video");
    }
    
    await conn.sendMessage(from, {
        video: { url: response.data.result.mp4 },
        caption: `> ${DESCRIPTION}`
    }, { quoted: message });
}

async function downloadFacebook(conn, from, url, message, DESCRIPTION) {
    const apiUrl = `https://jawad-tech.vercel.app/downloader?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data?.status || !response.data.result?.length) {
        throw new Error("Failed to fetch Facebook video");
    }
    
    const video = response.data.result.find(v => v.quality === "HD") || 
                  response.data.result.find(v => v.quality === "SD");
                  
    if (!video?.url) throw new Error("No video URL found");
    
    await conn.sendMessage(from, {
        video: { url: video.url },
        caption: `> ${DESCRIPTION}`
    }, { quoted: message });
}

async function downloadPinterest(conn, from, url, message, DESCRIPTION) {
    const apiUrl = `https://jawad-tech.vercel.app/download/pinterest?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl);

    if (!response.data?.status || !response.data.result?.url) {
        throw new Error("Failed to fetch Pinterest media");
    }
    
    const isVideo = response.data.result.type === 'video';
    
    await conn.sendMessage(from, {
        [isVideo ? 'video' : 'image']: { url: response.data.result.url },
        caption: `> ${DESCRIPTION}`
    }, { quoted: message });
}

async function handleDirectDownload(conn, from, url, message, DESCRIPTION) {
    try {
        const headResponse = await axios.head(url, { timeout: 5000 }).catch(() => null);
        let contentType = headResponse?.headers['content-type'];
        const contentLength = headResponse?.headers['content-length'];
        const fileName = url.split('/').pop().split('?')[0] || 'download';

        if (contentLength && parseInt(contentLength) > 100 * 1024 * 1024) {
            throw new Error("File too large (max 100MB)");
        }

        if (!contentType) {
            const ext = path.extname(fileName).toLowerCase();
            const mimeTypes = {
                '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
                '.gif': 'image/gif', '.webp': 'image/webp', '.bmp': 'image/bmp',
                '.mp4': 'video/mp4', '.mov': 'video/quicktime', '.avi': 'video/x-msvideo',
                '.mkv': 'video/x-matroska', '.webm': 'video/webm',
                '.mp3': 'audio/mpeg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
                '.ogg': 'audio/ogg', '.aac': 'audio/aac',
                '.pdf': 'application/pdf', '.zip': 'application/zip', '.rar': 'application/x-rar-compressed'
            };
            contentType = mimeTypes[ext] || 'application/octet-stream';
        }

        if (contentType.startsWith('image/')) {
            await conn.sendMessage(from, {
                image: { url: url },
                caption: `> ${DESCRIPTION}`
            }, { quoted: message });
        }
        else if (contentType.startsWith('video/')) {
            await conn.sendMessage(from, {
                video: { url: url },
                caption: `> ${DESCRIPTION}`,
                mimetype: contentType
            }, { quoted: message });
        }
        else if (contentType.startsWith('audio/')) {
            await conn.sendMessage(from, {
                audio: { url: url },
                mimetype: contentType,
                caption: `> ${DESCRIPTION}`
            }, { quoted: message });
        }
        else {
            const response = await axios({ method: 'GET', url: url, responseType: 'arraybuffer', timeout: 30000 });
            const buffer = Buffer.from(response.data);
            
            await conn.sendMessage(from, {
                document: buffer,
                fileName: fileName,
                mimetype: contentType,
                caption: `> ${DESCRIPTION}`
            }, { quoted: message });
        }

    } catch (error) {
        console.error("Direct download error:", error);
        
        try {
            const response = await axios({ method: 'GET', url: url, responseType: 'arraybuffer', timeout: 30000 });
            const buffer = Buffer.from(response.data);
            const fileName = url.split('/').pop().split('?')[0] || 'download';
            const contentType = response.headers['content-type'] || 'application/octet-stream';

            await conn.sendMessage(from, {
                document: buffer,
                fileName: fileName,
                mimetype: contentType,
                caption: `> ${DESCRIPTION}`
            }, { quoted: message });
        } catch (fallbackError) {
            throw new Error("Failed to download file");
        }
    }
}
