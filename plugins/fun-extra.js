// plugins/fun.js - ESM Version - All Fun Commands
import { fileURLToPath } from 'url';
import axios from 'axios';
import { cmd } from '../command.js';
import config from '../config.js';
import converter, { fetchEmix } from '../lib/converter.js';
import { getBuffer, lidToPhone, sleep } from '../lib/functions.js';
import { Sticker, StickerTypes } from 'wa-sticker-formatter';

const __filename = fileURLToPath(import.meta.url);
const RUN_MUREED_AUDIO = "https://files.catbox.moe/wuikae.mp3";
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ==================== EMIX COMMAND ====================
cmd({
    pattern: "emix",
    desc: "Combine two emojis into a sticker.",
    category: "fun",
    react: "😃",
    use: ".emix 😂,🙂",
    filename: __filename,
}, async (conn, mek, m, { q, reply }) => {
    try {
        if (!q || !q.includes(",")) {
            return reply("❌ *Usage:* .emix 😂,🙂\n_Send two emojis separated by a comma._");
        }

        let [emoji1, emoji2] = q.split(",").map(e => e.trim());

        if (!emoji1 || !emoji2) {
            return reply("❌ Please provide two emojis separated by a comma.");
        }

        let imageUrl = await fetchEmix(emoji1, emoji2);

        if (!imageUrl) {
            return reply("❌ Could not generate emoji mix. Try different emojis.");
        }

        let buffer = await getBuffer(imageUrl);
        let sticker = new Sticker(buffer, {
            pack: "Emoji Mix",
            author: "KHAN-MD",
            type: StickerTypes.FULL,
            categories: ["🤩", "🎉"],
            quality: 75,
            background: "transparent",
        });

        const stickerBuffer = await sticker.toBuffer();
        await conn.sendMessage(mek.chat, { sticker: stickerBuffer }, { quoted: mek });

    } catch (e) {
        console.error("Error in .emix command:", e.message);
        reply(`❌ Could not generate emoji mix: ${e.message}`);
    }
});

// ==================== COMPATIBILITY COMMAND ====================
cmd({
    pattern: "compatibility",
    alias: ["friend", "fcheck"],
    desc: "Calculate the compatibility score between two users.",
    category: "fun",
    react: "💖",
    filename: __filename,
    use: "@tag1 @tag2",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 2) {
            return reply("Please mention two users to calculate compatibility.\nUsage: `.compatibility @user1 @user2`");
        }

        let user1 = m.mentionedJid[0];
        let user2 = m.mentionedJid[1];

        const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
        let compatibilityScore = Math.floor(Math.random() * 1000) + 1;

        if (user1 === specialNumber || user2 === specialNumber) {
            compatibilityScore = 1000;
            return reply(`💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}+/1000 💖`);
        }

        await conn.sendMessage(mek.chat, {
            text: `💖 Compatibility between @${user1.split('@')[0]} and @${user2.split('@')[0]}: ${compatibilityScore}/1000 💖`,
            mentions: [user1, user2],
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== AURA COMMAND ====================
cmd({
    pattern: "aura",
    desc: "Calculate aura score of a user.",
    category: "fun",
    react: "💀",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) {
            return reply("Please mention a user to calculate their aura.\nUsage: `.aura @user`");
        }

        let user = m.mentionedJid[0];
        const specialNumber = config.DEV ? `${config.DEV}@s.whatsapp.net` : null;
        let auraScore = Math.floor(Math.random() * 1000) + 1;

        if (user === specialNumber) {
            auraScore = 999999;
            return reply(`💀 Aura of @${user.split('@')[0]}: ${auraScore}+ 🗿`);
        }

        await conn.sendMessage(mek.chat, {
            text: `💀 Aura of @${user.split('@')[0]}: ${auraScore}/1000 🗿`,
            mentions: [user],
        }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== ROAST COMMAND ====================
cmd({
    pattern: "roast",
    desc: "Roast someone in Hindi",
    category: "fun",
    react: "🔥",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { reply }) => {
    let roasts = [
        "Abe bhai, tera IQ wifi signal se bhi kam hai!",
        "Bhai, teri soch WhatsApp status jaisi hai, 24 ghante baad gayab ho jaati hai!",
        "Abe sochta kitna hai, tu kya NASA ka scientist hai?",
        "Abe tu hai kaun? Google pe search karne se bhi tera naam nahi aata!",
        "Tera dimaag 2G network pe chal raha hai kya?",
        "Itna overthink mat kar bhai, teri battery jaldi down ho jayegi!",
        "Teri soch cricket ke match jaisi hai, baarish aate hi band ho jati hai!",
        "Tu VIP hai, 'Very Idiotic Person'!",
        "Abe tu kis planet se aaya hai, yeh duniya tere jaise aliens ke liye nahi hai!",
        "Tere dimag mein khojne ka itna kuch hai, lekin koi result nahi milta!",
        "Teri zindagi WhatsApp status jaisi hai, kabhi bhi delete ho sakti hai!",
        "Tera style bilkul WiFi password ki tarah hai, sabko pata nahi!",
        "Abe tu toh wahi hai jo apni zindagi ka plot twist bhi Google karta hai!",
        "Abe tu toh software update bhi nahi chalne wala, pura hang hai!",
        "Tere sochne se zyada toh Google search karne mein time waste ho jaata hai!",
        "Mere paas koi shabdon ki kami nahi hai, bas tujhe roast karne ka mood nahi tha!",
        "Teri personality toh dead battery jaisi hai, recharge karne ka time aa gaya hai!",
        "Bhai, teri soch ke liye ek dedicated server hona chahiye!",
        "Abe tu kaunsa game khel raha hai, jisme har baar fail ho jaata hai?",
        "Tere jokes bhi software update ki tarah hote hain, baar-baar lagte hain par kaam nahi karte!",
        "Teri wajah se toh mere phone ka storage bhi full ho jaata hai!",
        "Abe bhai, tu na ek walking meme ban gaya hai!",
        "Abe apne aap ko bada smart samajhta hai, par teri brain cells toh overload mein hain!",
        "Teri wajah se toh humari group chat ko mute karne ka sochna padta hai!",
        "Abe tere jaise log hamesha apne aap ko hero samajhte hain, par actually toh tum villain ho!",
        "Tere jaise logon ke liye zindagi mein rewind aur fast forward button hona chahiye!",
        "Tere mooh se nikla har lafz ek naya bug hai!",
        "Abe tu apni zindagi ke saath save nahi kar paaya, aur dusron ke liye advice de raha hai!",
        "Tu apne life ka sabse bada virus hai!",
        "Abe tu hain ya koi broken app?",
        "Tere soch ke liye CPU ki zarurat hai, par lagta hai tera CPU khatam ho gaya!",
        "Abe tu kya kar raha hai, ek walking error message ban gaya hai!",
        "Teri taareef toh bas lagti hai, par teri asli aukaat toh sabko pata hai!",
        "Tera brain toh ek broken link ki tarah hai, sab kuch dhundne ke bawajood kuch nahi milta!",
        "Bhai, tujhe dekh ke toh lagta hai, Netflix bhi teri wajah se crash ho gaya!",
        "Teri tasveer toh bas ek screenshot lagti hai, real life mein tu kuch bhi nahi!",
        "Abe bhai, tu lagta hai toh I-phone ho, lekin andar kaafi purana android hai!",
        "Abe, tere jaisi soch se toh Google bhi nafrat karta hoga!",
        "Bhai tu apne chehre se ghazab ka mood bana le, shayad koi notice kar le!",
        "Tere kaam bhi uss app ki tarah hote hain jo crash ho jata hai jab sabko zarurat ho!",
        "Teri zindagi ke sabse bada hack toh hai - 'Log mujhse kuch bhi expect mat karo'!",
        "Abe tu apne aap ko hi mirror mein dekh ke samajhta hai ki sab kuch sahi hai!",
        "Abe tu apne dimaag ko low power mode mein daalke chalta hai!",
        "Tere paas ideas hain, par sab outdated hain jaise Windows XP!",
        "Teri soch toh ek system error ki tarah hai, restart karna padega!",
        "Teri personality toh ek empty hard drive jaise hai, kuch bhi valuable nahi!",
        "Tere chehre pe kisi ne 'loading' likh diya hai, par kabhi bhi complete nahi hota!",
        "Tera dimaag toh ek broken link ki tarah hai, kabhi bhi connect nahi hota!",
        "Abe, teri soch se toh Google ka algorithm bhi confused ho jata hai!",
        "Tere jaisa banda, aur aise ideas? Yeh toh humne science fiction mein dekha tha!",
        "Abe tu apne chehre pe 'not found' likhwa le, kyunki sabko kuch milta nahi!",
        "Teri soch itni slow hai, Google bhi teri madad nahi kar paata!",
        "Abe tu toh '404 not found' ka living example hai!",
        "Tera dimaag bhi phone ki battery jaise hai, kabhi bhi drain ho jaata hai!",
        "Abe tu toh wahi hai, jo apni zindagi ka password bhool jaata hai!",
        "Abe tu jise apni soch samajhta hai, wo ek 'buffering' hai!",
        "Teri life ke decisions itne confusing hain, ki KBC ke host bhi haraan ho jaaye!",
        "Bhai, tere jaise logo ke liye ek dedicated 'error' page hona chahiye!",
        "Teri zindagi ko 'user not found' ka message mil gaya hai!",
        "Teri baatein utni hi value rakhti hain, jitni 90s ke mobile phones mein camera quality thi!",
        "Abe bhai, tu toh har waqt 'under construction' rehta hai!",
        "Tere saath toh life ka 'unknown error' hota hai, koi solution nahi milta!",
        "Bhai, tere chehre pe ek warning sign hona chahiye - 'Caution: Too much stupidity ahead'!",
        "Teri har baat pe lagta hai, system crash hone waala hai!",
        "Tere paas idea hai, par wo abhi bhi 'under review' hai!"
    ];

    let randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);

    if (!mentionedUser) {
        return reply("Usage: .roast @user (Tag someone to roast them!)");
    }

    let target = `@${mentionedUser.split("@")[0]}`;
    let message = `${target} :\n *${randomRoast}*\n> This is all for fun, don't take it seriously!`;
    await conn.sendMessage(mek.chat, { text: message, mentions: [mek.sender, mentionedUser] }, { quoted: mek });
});

// ==================== 8BALL COMMAND ====================
cmd({
    pattern: "8ball",
    desc: "Magic 8-Ball gives answers",
    category: "fun",
    react: "🎱",
    filename: __filename
}, async (conn, mek, m, { q, reply }) => {
    if (!q) return reply("Ask a yes/no question! Example: .8ball Will I be rich?");

    let responses = [
        "Yes!", "No.", "Maybe...", "Definitely!", "Not sure.",
        "Ask again later.", "I don't think so.", "Absolutely!",
        "No way!", "Looks promising!"
    ];

    let answer = responses[Math.floor(Math.random() * responses.length)];
    reply(`🎱 *Magic 8-Ball says:* ${answer}`);
});

// ==================== COMPLIMENT COMMAND ====================
cmd({
    pattern: "compliment",
    desc: "Give a nice compliment",
    category: "fun",
    react: "😊",
    filename: __filename,
    use: "@tag (optional)"
}, async (conn, mek, m, { reply }) => {
    let compliments = [
        "You're amazing just the way you are! 💖",
        "You light up every room you walk into! 🌟",
        "Your smile is contagious! 😊",
        "You're a genius in your own way! 🧠",
        "You bring happiness to everyone around you! 🥰",
        "You're like a human sunshine! ☀️",
        "Your kindness makes the world a better place! ❤️",
        "You're unique and irreplaceable! ✨",
        "You're a great listener and a wonderful friend! 🤗",
        "Your positive vibes are truly inspiring! 💫",
        "You're stronger than you think! 💪",
        "Your creativity is beyond amazing! 🎨",
        "You make life more fun and interesting! 🎉",
        "Your energy is uplifting to everyone around you! 🔥",
        "You're a true leader, even if you don’t realize it! 🏆",
        "Your words have the power to make people smile! 😊",
        "You're so talented, and the world needs your skills! 🎭",
        "You're a walking masterpiece of awesomeness! 🎨",
        "You're proof that kindness still exists in the world! 💕",
        "You make even the hardest days feel a little brighter! ☀️"
    ];

    let randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
    let mentionedUser = m.mentionedJid[0] || (mek.quoted && mek.quoted.sender);
    let target = mentionedUser ? `@${mentionedUser.split("@")[0]}` : "";

    let message = mentionedUser
        ? `@${mek.sender.split("@")[0]} complimented ${target}:\n😊 *${randomCompliment}*`
        : `@${mek.sender.split("@")[0]}, you forgot to tag someone! But hey, here's a compliment for you:\n😊 *${randomCompliment}*`;

    await conn.sendMessage(mek.chat, { text: message, mentions: [mek.sender, mentionedUser].filter(Boolean) }, { quoted: mek });
});

// ==================== LOVETEST COMMAND ====================
cmd({
    pattern: "lovetest",
    desc: "Check love compatibility between two users",
    category: "fun",
    react: "❤️",
    filename: __filename,
    use: "@tag1 @tag2"
}, async (conn, mek, m, { args, reply }) => {
    if (args.length < 2) return reply("Tag two users! Example: .lovetest @user1 @user2");

    let user1 = args[0].replace("@", "") + "@s.whatsapp.net";
    let user2 = args[1].replace("@", "") + "@s.whatsapp.net";
    let lovePercent = Math.floor(Math.random() * 100) + 1;

    let messages = [
        { range: [90, 100], text: "💖 *A match made in heaven!* True love exists!" },
        { range: [75, 89], text: "😍 *Strong connection!* This love is deep and meaningful." },
        { range: [50, 74], text: "😊 *Good compatibility!* You both can make it work." },
        { range: [30, 49], text: "🤔 *It’s complicated!* Needs effort, but possible!" },
        { range: [10, 29], text: "😅 *Not the best match!* Maybe try being just friends?" },
        { range: [1, 9], text: "💔 *Uh-oh!* This love is as real as a Bollywood breakup!" }
    ];

    let loveMessage = messages.find(msg => lovePercent >= msg.range[0] && lovePercent <= msg.range[1]).text;
    let message = `💘 *Love Compatibility Test* 💘\n\n❤️ *@${user1.split("@")[0]}* + *@${user2.split("@")[0]}* = *${lovePercent}%*\n${loveMessage}`;

    await conn.sendMessage(mek.chat, { text: message, mentions: [user1, user2] }, { quoted: mek });
});

// ==================== EMOJI COMMAND ====================
cmd({
    pattern: "emoji",
    desc: "Convert text into emoji form.",
    category: "fun",
    react: "🙂",
    filename: __filename,
    use: "<text>"
}, async (conn, mek, m, { args, reply }) => {
    try {
        let text = args.join(" ");
        let emojiMapping = {
            "a": "🅰️", "b": "🅱️", "c": "🇨️", "d": "🇩️", "e": "🇪️", "f": "🇫️", "g": "🇬️",
            "h": "🇭️", "i": "🇮️", "j": "🇯️", "k": "🇰️", "l": "🇱️", "m": "🇲️", "n": "🇳️",
            "o": "🅾️", "p": "🇵️", "q": "🇶️", "r": "🇷️", "s": "🇸️", "t": "🇹️", "u": "🇺️",
            "v": "🇻️", "w": "🇼️", "x": "🇽️", "y": "🇾️", "z": "🇿️",
            "0": "0️⃣", "1": "1️⃣", "2": "2️⃣", "3": "3️⃣", "4": "4️⃣",
            "5": "5️⃣", "6": "6️⃣", "7": "7️⃣", "8": "8️⃣", "9": "9️⃣",
            " ": "␣",
        };

        let emojiText = text.toLowerCase().split("").map(char => emojiMapping[char] || char).join("");

        if (!text) {
            return reply("Please provide some text to convert into emojis!");
        }

        await conn.sendMessage(mek.chat, { text: emojiText }, { quoted: mek });

    } catch (error) {
        console.log(error);
        reply(`Error: ${error.message}`);
    }
});

// ==================== SHIP COMMAND ====================
cmd({
    pattern: "ship",
    alias: ["match"],
    desc: "Randomly pairs the command user with another group member.",
    react: "❤️",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to make a pair.");
        const randomPair = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const user1 = sender.split("@")[0];
        const user2 = randomPair.split("@")[0];
        const message = `💘 *Match Found!* 💘\n❤️ @${user1} + @${user2}\n💖 Congratulations! 🎉`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [sender, randomPair] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in ship command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== DAD COMMAND ====================
cmd({
    pattern: "dad",
    alias: ["father", "papa", "baap"],
    desc: "Assigns a random dad from group members.",
    react: "👨",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a dad.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👨 *Dad Found!* 👨\n@${userName} is your dad!\n💖 Father figure alert!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in dad command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== MOM COMMAND ====================
cmd({
    pattern: "mom",
    alias: ["mother", "maa", "mummy"],
    desc: "Assigns a random mom from group members.",
    react: "👩",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a mom.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👩 *Mom Found!* 👩\n@${userName} is your mom!\n💖 Mother figure alert!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in mom command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== SON COMMAND ====================
cmd({
    pattern: "son",
    alias: ["beta"],
    desc: "Assigns a random son from group members.",
    react: "👦",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a son.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👦 *Son Found!* 👦\n@${userName} is your son!\n🧒 Take care of your child!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in son command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== DAUGHTER COMMAND ====================
cmd({
    pattern: "daughter",
    alias: ["beti"],
    desc: "Assigns a random daughter from group members.",
    react: "👧",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a daughter.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👧 *Daughter Found!* 👧\n@${userName} is your daughter!\n👧 Love your little girl!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in daughter command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BOYFRIEND COMMAND ====================
cmd({
    pattern: "boyfriend",
    alias: ["bfriend", "boyfrnd"],
    desc: "Assigns a random boyfriend from group members.",
    react: "👨‍❤️‍👨",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a boyfriend.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👨‍❤️‍👨 *Boyfriend Found!* 👨‍❤️‍👨\n@${userName} is your boyfriend!\n💑 Go on a date!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in boyfriend command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== GIRLFRIEND COMMAND ====================
cmd({
    pattern: "girlfriend",
    alias: ["gfriend", "girlfrnd"],
    desc: "Assigns a random girlfriend from group members.",
    react: "👩‍❤️‍👩",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a girlfriend.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👩‍❤️‍👩 *Girlfriend Found!* 👩‍❤️‍👩\n@${userName} is your girlfriend!\n💑 Go on a date!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in girlfriend command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== TWIN COMMAND ====================
cmd({
    pattern: "twin",
    alias: ["jodua"],
    desc: "Assigns a random twin from group members.",
    react: "👯",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a twin.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👯 *Twin Found!* 👯\n@${userName} is your twin!\n🎭 You look exactly alike!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in twin command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== PARTNER COMMAND ====================
cmd({
    pattern: "partner",
    alias: ["jodi"],
    desc: "Assigns a random partner from group members.",
    react: "🤝",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a partner.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🤝 *Partner Found!* 🤝\n@${userName} is your partner!\n🤝 Work together!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in partner command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BODYGUARD COMMAND ====================
cmd({
    pattern: "bodyguard",
    alias: ["rakshak", "guard"],
    desc: "Assigns a random bodyguard from group members.",
    react: "💂",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a bodyguard.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `💂 *Bodyguard Found!* 💂\n@${userName} is your bodyguard!\n🛡️ They will protect you!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in bodyguard command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BOSS COMMAND ====================
cmd({
    pattern: "boss",
    alias: ["maalik", "owner"],
    desc: "Assigns a random boss from group members.",
    react: "👔",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a boss.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👔 *Boss Found!* 👔\n@${userName} is your boss!\n💼 Listen to them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in boss command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== EMPLOYEE COMMAND ====================
cmd({
    pattern: "employee",
    alias: ["naukar", "worker"],
    desc: "Assigns a random employee from group members.",
    react: "👷",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find an employee.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👷 *Employee Found!* 👷\n@${userName} is your employee!\n💼 Give them work!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in employee command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== PET COMMAND ====================
cmd({
    pattern: "pet",
    alias: ["janwar", "animal"],
    desc: "Assigns a random pet from group members.",
    react: "🐶",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a pet.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🐶 *Pet Found!* 🐶\n@${userName} is your pet!\n🐕 Take good care of them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in pet command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== SERVANT COMMAND ====================
cmd({
    pattern: "servant",
    alias: ["naukar", "chhakar"],
    desc: "Assigns a random servant from group members.",
    react: "🧹",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a servant.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧹 *Servant Found!* 🧹\n@${userName} is your servant!\n🧽 Make them work!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in servant command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== IDOL COMMAND ====================
cmd({
    pattern: "idol",
    alias: ["hero", "star"],
    desc: "Assigns a random idol from group members.",
    react: "🌟",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find an idol.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🌟 *Idol Found!* 🌟\n@${userName} is your idol!\n⭐ Worship them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in idol command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== FAN COMMAND ====================
cmd({
    pattern: "fan",
    alias: ["deewana"],
    desc: "Assigns a random fan from group members.",
    react: "🤩",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a fan.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🤩 *Fan Found!* 🤩\n@${userName} is your fan!\n🙏 They admire you!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in fan command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== GHOST COMMAND ====================
cmd({
    pattern: "ghost",
    alias: ["bhoot", "pret"],
    desc: "Assigns a random ghost from group members.",
    react: "👻",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a ghost.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👻 *Ghost Found!* 👻\n@${userName} is a ghost!\n👀 Watch out for them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in ghost command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== ANGEL COMMAND ====================
cmd({
    pattern: "angel",
    desc: "Assigns a random angel from group members.",
    react: "😇",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find an angel.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `😇 *Angel Found!* 😇\n@${userName} is an angel!\n✨ They watch over you!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in angel command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== DEVIL COMMAND ====================
cmd({
    pattern: "devil",
    alias: ["shaitan", "rakshas"],
    desc: "Assigns a random devil from group members.",
    react: "😈",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a devil.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `😈 *Devil Found!* 😈\n@${userName} is a devil!\n🔥 Stay away from them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in devil command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== KING COMMAND ====================
cmd({
    pattern: "king",
    alias: ["raja", "badshah"],
    desc: "Assigns a random king from group members.",
    react: "👑",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a king.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👑 *King Found!* 👑\n@${userName} is the king!\n🏰 Bow before them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in king command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== QUEEN COMMAND ====================
cmd({
    pattern: "queen",
    alias: ["rani", "malika"],
    desc: "Assigns a random queen from group members.",
    react: "👸",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a queen.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👸 *Queen Found!* 👸\n@${userName} is the queen!\n🏰 Bow before her!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in queen command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== SLAVE COMMAND ====================
cmd({
    pattern: "slave",
    alias: ["gulam", "banda"],
    desc: "Assigns a random slave from group members.",
    react: "⛓️",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a slave.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `⛓️ *Slave Found!* ⛓️\n@${userName} is your slave!\n🔗 Make them obey!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in slave command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== MASTER COMMAND ====================
cmd({
    pattern: "master",
    alias: ["maalik", "swami"],
    desc: "Assigns a random master from group members.",
    react: "🎩",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a master.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🎩 *Master Found!* 🎩\n@${userName} is your master!\n🎭 Obey them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in master command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== GENIUS COMMAND ====================
cmd({
    pattern: "genius",
    alias: ["budhimaan", "smart"],
    desc: "Assigns a random genius from group members.",
    react: "🧠",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a genius.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧠 *Genius Found!* 🧠\n@${userName} is a genius!\n💡 Learn from them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in genius command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== FOOL COMMAND ====================
cmd({
    pattern: "fool",
    alias: ["bewakoof", "stupid"],
    desc: "Assigns a random fool from group members.",
    react: "🤡",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a fool.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🤡 *Fool Found!* 🤡\n@${userName} is a fool!\n🎭 Don't listen to them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in fool command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== RICH COMMAND ====================
cmd({
    pattern: "rich",
    alias: ["amir", "crorepati"],
    desc: "Assigns a random rich person from group members.",
    react: "💰",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a rich person.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `💰 *Rich Person Found!* 💰\n@${userName} is rich!\n💵 Ask for money!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in rich command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== POOR COMMAND ====================
cmd({
    pattern: "poor",
    alias: ["garib", "bechara"],
    desc: "Assigns a random poor person from group members.",
    react: "🪙",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a poor person.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🪙 *Poor Person Found!* 🪙\n@${userName} is poor!\n🙏 Help them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in poor command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BHAI COMMAND ====================
cmd({
    pattern: "bhai",
    alias: ["brother"],
    desc: "Assigns a random brother from group members.",
    react: "👨‍🦰",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a brother.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👬 *Brother Found!* 👬\n@${userName} is your brother!\n💪 Take care of each other!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in bhai command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BAHAN COMMAND ====================
cmd({
    pattern: "bahan",
    alias: ["sister", "behen"],
    desc: "Assigns a random sister from group members.",
    react: "👩",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a sister.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👭 *Sister Found!* 👭\n@${userName} is your sister!\n💖 Love and protect each other!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in bahan command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== WIFE COMMAND ====================
cmd({
    pattern: "wife",
    alias: ["biwi"],
    desc: "Assigns a random wife from group members.",
    react: "👰",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a wife.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `💍 *Wife Found!* 💍\n@${userName} is your wife!\n💕 Treat her with love and respect!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in wife command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== HUSBAND COMMAND ====================
cmd({
    pattern: "husband",
    alias: ["shohar"],
    desc: "Assigns a random husband from group members.",
    react: "🤵",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a husband.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `💍 *Husband Found!* 💍\n@${userName} is your husband!\n💕 Take care of him!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in husband command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== CHACHA COMMAND ====================
cmd({
    pattern: "chacha",
    desc: "Assigns a random paternal uncle from group members.",
    react: "👨‍🦳",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a chacha.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧓 *Chacha Found!* 🧓\n@${userName} is your chacha (paternal uncle)!\n👴 Respect your elders!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in chacha command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== CHACHI COMMAND ====================
cmd({
    pattern: "chachi",
    desc: "Assigns a random paternal aunt from group members.",
    react: "👵",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a chachi.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧓 *Chachi Found!* 🧓\n@${userName} is your chachi (paternal aunt)!\n👵 Respect your elders!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in chachi command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== NANA COMMAND ====================
cmd({
    pattern: "nana",
    desc: "Assigns a random maternal grandfather from group members.",
    react: "👴",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a nana.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👴 *Nana Found!* 👴\n@${userName} is your nana (maternal grandfather)!\n🌳 Your family tree grows!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in nana command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== NANI COMMAND ====================
cmd({
    pattern: "nani",
    desc: "Assigns a random maternal grandmother from group members.",
    react: "👵",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a nani.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👵 *Nani Found!* 👵\n@${userName} is your nani (maternal grandmother)!\n🌳 Your family tree grows!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in nani command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== MAMA COMMAND ====================
cmd({
    pattern: "mama",
    desc: "Assigns a random maternal uncle from group members.",
    react: "🧔",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a mama.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧔 *Mama Found!* 🧔\n@${userName} is your mama (maternal uncle)!\n👨‍👦 Treat him with respect!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in mama command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== MAMI COMMAND ====================
cmd({
    pattern: "mami",
    desc: "Assigns a random maternal aunt from group members.",
    react: "👩‍🦰",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a mami.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👩‍🦰 *Mami Found!* 👩‍🦰\n@${userName} is your mami (maternal aunt)!\n👩‍👧 Treat her with respect!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in mami command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== BESTFRIEND COMMAND ====================
cmd({
    pattern: "bestfriend",
    alias: ["bf", "bestie"],
    desc: "Assigns a random best friend from group members.",
    react: "🤝",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a best friend.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🤝 *Best Friend Found!* 🤝\n@${userName} is your best friend!\n👫 Friends forever!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in bestfriend command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== ENEMY COMMAND ====================
cmd({
    pattern: "enemy",
    alias: ["dushman"],
    desc: "Assigns a random enemy from group members.",
    react: "😠",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find an enemy.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `😠 *Enemy Found!* 😠\n@${userName} is your enemy!\n⚔️ Watch your back!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in enemy command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== CRUSH COMMAND ====================
cmd({
    pattern: "crush",
    alias: ["pyaar"],
    desc: "Assigns a random crush from group members.",
    react: "😍",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a crush.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `😍 *Crush Found!* 😍\n@${userName} is your crush!\n💘 You have feelings for them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in crush command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== TEACHER COMMAND ====================
cmd({
    pattern: "teacher",
    alias: ["sir", "guru"],
    desc: "Assigns a random teacher from group members.",
    react: "👨‍🏫",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a teacher.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `👨‍🏫 *Teacher Found!* 👨‍🏫\n@${userName} is your teacher!\n📚 Learn from them!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in teacher command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== STUDENT COMMAND ====================
cmd({
    pattern: "student",
    alias: ["chela"],
    desc: "Assigns a random student from group members.",
    react: "🧑‍🎓",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a student.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `🧑‍🎓 *Student Found!* 🧑‍🎓\n@${userName} is your student!\n📖 Teach them well!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in student command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== RIVAL COMMAND ====================
cmd({
    pattern: "rival",
    alias: ["competitor"],
    desc: "Assigns a random rival from group members.",
    react: "⚔️",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, reply }) => {
    try {
        if (!isGroup) return reply("❌ This command can only be used in groups.");
        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants.map(user => user.id);
        const otherParticipants = participants.filter(id => id !== sender);
        if (otherParticipants.length === 0) return reply("❌ Not enough participants to find a rival.");
        const randomPerson = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        const userName = randomPerson.split("@")[0];
        const message = `⚔️ *Rival Found!* ⚔️\n@${userName} is your rival!\n🏆 Compete fairly!`;
        await conn.sendMessage(from, { text: message, contextInfo: { mentionedJid: [randomPerson] } }, { quoted: mek });
    } catch (error) {
        console.error("❌ Error in rival command:", error);
        reply("⚠️ An error occurred while processing the command. Please try again.");
    }
});

// ==================== RUNMUREED COMMAND ====================
cmd({
    pattern: "runmureed",
    desc: "Run Mureed Audio",
    category: "fun",
    react: "🎧",
    filename: __filename
}, async (conn, mek, m, { from, reply, react }) => {
    try {
        await conn.sendMessage(from, {
            audio: { url: RUN_MUREED_AUDIO },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });
        await react("✅");
    } catch (e) {
        console.error("Error in runmureed command:", e);
        await react("❌");
        reply("❌ Audio play nahi ho saki");
    }
});

// ==================== FLIRT COMMAND ====================
cmd({
    pattern: "flirt",
    alias: ["line"],
    desc: "Get a random flirty message",
    react: "😘",
    category: "fun",
    use: '.flirt',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const apiUrl = 'https://shizoapi.onrender.com/api/texts/flirt?apikey=shizo';
        const { data } = await axios.get(apiUrl);
        if (!data.result) return reply("❌ Couldn't fetch a flirty message. Try again later!");
        const flirtMessage = `${data.result}`.trim();
        await reply(flirtMessage);
    } catch (error) {
        console.error('Flirt Error:', error);
        reply("❌ Failed to fetch a flirty message. Maybe try being romantic yourself?");
    }
});

// ==================== QUOTE COMMAND ====================
cmd({
  pattern: "quote",
  desc: "Get a random inspiring quote.",
  category: "fun",
  react: "💬",
  filename: __filename
}, async (conn, m, store, { from, reply }) => {
  try {
    const response = await axios.get("https://api.quotable.io/random");
    const { content, author } = response.data;
    const message = `💬 *"${content}"*\n- ${author}\n\n> *QUOTES BY KHAN MD*`;
    reply(message);
  } catch (error) {
    console.error("Error fetching quote:", error);
    reply("⚠️ API issue or coding error, please check the logs!");
  }
});

// ==================== COSPLAY COMMAND ====================
cmd({
  pattern: "cosplay",
  alias: ["cosplayimg", "cos"],
  react: '📸',
  desc: "Get random cosplay image",
  category: "fun",
  filename: __filename
}, async (conn, mek, m, { from, reply }) => {
  try {
    await conn.sendMessage(from, { react: { text: '⏳', key: mek.key } });
    const apiUrl = "https://rynekoo-api.hf.space/random/cosplay";
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const imageBuffer = await response.buffer();
    if (!imageBuffer || imageBuffer.length === 0) throw new Error("No image data received");
    await conn.sendMessage(from, { react: { text: '✅', key: mek.key } });
    await conn.sendMessage(from, { image: imageBuffer, caption: `*📸 Random Cosplay Image*\n\n> Powered by Rynekoo API`, mimetype: "image/jpeg" }, { quoted: mek });
  } catch (error) {
    console.error("Cosplay Error:", error);
    await conn.sendMessage(from, { react: { text: '❌', key: mek.key } });
    await reply(`❌ Error fetching cosplay image:\n${error.message}`);
  }
});

// ==================== JOKE COMMAND ====================
cmd({
  pattern: "joke",
  desc: "😂 Get a random joke",
  react: "🤣",
  category: "fun",
  filename: __filename
}, async (conn, m, store, { reply }) => {
  try {
    const response = await axios.get("https://official-joke-api.appspot.com/random_joke");
    const joke = response.data;
    if (!joke || !joke.setup || !joke.punchline) return reply("❌ Failed to fetch a joke. Please try again.");
    const jokeMessage = `🤣 *Here's a random joke for you!* 🤣\n\n*${joke.setup}*\n\n${joke.punchline} 😆\n\n> *© Powered by JawadTechX*`;
    return reply(jokeMessage);
  } catch (error) {
    console.error("❌ Error in joke command:", error);
    return reply("⚠️ An error occurred while fetching the joke. Please try again.");
  }
});

// ==================== BACHA COMMAND ====================
cmd({
  pattern: "bacha",
  alias: ["larka"],
  desc: "Randomly selects a boy from the group",
  react: "👦",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { from, sender, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups!");
    const groupMetadata = await conn.groupMetadata(from);
    if (!groupMetadata?.participants) return reply("⚠️ Couldn't fetch group members.");
    const botNumber = conn.user.id;
    const participants = groupMetadata.participants
      .filter(p => p.id !== botNumber && p.id !== sender)
      .map(p => p.id);
    if (participants.length < 1) return reply("❌ No eligible participants found!");
    const randomUser = participants[Math.floor(Math.random() * participants.length)];
    const userName = randomUser.split("@")[0];
    await conn.sendMessage(from, { 
      text: `👦 *Yeh lo tumhara Bacha!*\n\n@${userName} is your handsome boy! 😎`, 
      contextInfo: { mentionedJid: [randomUser] }
    }, { quoted: mek });
  } catch (error) {
    console.error("Error in .bacha command:", error);
    reply("❌ An error occurred while selecting a boy.");
  }
});

// ==================== BACHI COMMAND ====================
cmd({
  pattern: "bachi",
  alias: ["kuri", "larki"],
  desc: "Randomly selects a girl from the group",
  react: "👧",
  category: "fun",
  filename: __filename
}, async (conn, mek, store, { from, sender, isGroup, reply }) => {
  try {
    if (!isGroup) return reply("❌ This command can only be used in groups!");
    const groupMetadata = await conn.groupMetadata(from);
    if (!groupMetadata?.participants) return reply("⚠️ Couldn't fetch group members.");
    const botNumber = conn.user.id;
    const participants = groupMetadata.participants
      .filter(p => p.id !== botNumber && p.id !== sender)
      .map(p => p.id);
    if (participants.length < 1) return reply("❌ No eligible participants found!");
    const randomUser = participants[Math.floor(Math.random() * participants.length)];
    const userName = randomUser.split("@")[0];
    await conn.sendMessage(from, { 
      text: `👧 *Yeh lo tumhari Bachi!*\n\n@${userName} is your beautiful girl! 💖`, 
      contextInfo: { mentionedJid: [randomUser] }
    }, { quoted: mek });
  } catch (error) {
    console.error("Error in .bachi command:", error);
    reply("❌ An error occurred while selecting a girl.");
  }
});

// ==================== TECHNOLOGIA COMMAND ====================
cmd({
    pattern: "technologia",
    alias: ["tech", "technologyia"],
    desc: "Send the Technologia meme audio",
    category: "fun",
    react: "😂",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        await conn.sendMessage(from, {
            audio: { url: "https://files.catbox.moe/fac856.mp3" },
            mimetype: "audio/mpeg",
            ptt: false
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply("*❌ Technologia Failed!*\n_Blyat! Error: " + e.message + "_");
    }
});

// ==================== TAROUN COMMAND ====================
cmd({
    pattern: "taroun",
    alias: ["tadao", "tung"],
    desc: "Send the Taroun meme audio",
    category: "fun",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const audioUrl = "https://files.catbox.moe/tkawe4.mp3";
        await conn.sendPresenceUpdate('recording', from);
        const audioResponse = await fetch(audioUrl);
        const arrayBuffer = await audioResponse.arrayBuffer();
        const audioBuffer = Buffer.from(arrayBuffer);
        await delay(3000);
        const pttAudio = await converter.toPTT(audioBuffer, 'mp3');
        await conn.sendMessage(from, {
            audio: pttAudio,
            mimetype: 'audio/ogg; codecs=opus',
            ptt: true
        }, { quoted: mek });
    } catch (e) {
        console.error(e);
        reply(`*❌ Taroun Failed!*\n_Error: ${e.message}_`);
    }
});

// ==================== CAKE COMMAND ====================
cmd({
    pattern: "cake",
    desc: "Roast Cake (Qamar) with cake-themed insults",
    category: "fun",
    react: "🎂",
    filename: __filename,
    use: "@tag"
}, async (conn, mek, m, { reply }) => {
    const cakeRoasts = [
        "Abe Cake, tu toh wahi hai jo oven mein 2 ghante mein bhi rise nahi hota!",
        "Bhai Cake, teri personality expired sponge cake jaisi hai - dry aur tasteless!",
        "Abe Cake, tera dimaag frosting ki tarah hai - zyada meetha par koi depth nahi!",
        "Tu toh wahi burnt cupcake hai jo koi kharidne nahi aata!",
        "Abe Cake, teri soch cake mix jaisi hai - just add water aur kuch bhi nahi!",
        "Bhai tu toh stale cake hai, fridge mein 1 mahine se pada hua!",
        "Abe Cake, teri zindagi eggless cake jaisi hai - missing the main ingredient!",
        "Tu toh wahi dry fruit cake hai jo sab avoid karte hain!",
        "Abe Cake, tera IQ cake tin se bhi chhota hai!",
        "Bhai tu toh melted ice cream cake hai, shapeless aur messy!",
        "Abe Cake, teri baatein fondant jaisi hain - dikhti achi hain par taste kharab!",
        "Tu toh wahi cake hai jismein candle jalaane se pehle hi bujh jaati hai!",
        "Abe Cake, tera style layered cake jaisa hai - zyada layers, zero substance!",
        "Bhai tu toh microwave cake hai - jaldi bana par koi nahi khata!",
        "Abe Cake, teri soch cake batter jaisi hai - ghulti nahi aur lumpy hai!",
        "Tu toh wahi wedding cake hai jo display ke baad kachre mein jaata hai!",
        "Abe Cake, tera dimaag cake server jaisa hai - bas pieces kaat ta hai!",
        "Bhai tu toh gluten-free cake hai - sab avoid karte hain samajh ke!",
        "Abe Cake, teri personality fruit cake jaisi hai - koi nahi chunta voluntarily!",
        "Tu toh wahi cake hai jo delivery mein damage ho gaya ho!",
        "Abe Cake, tera zindagi ka recipe hi galat hai!",
        "Bhai tu toh cake pop hai - chhota aur insignificant!",
        "Abe Cake, teri baatein cake crumbs jaisi hain - har jagah bikhri hain!",
        "Tu toh wahi cake hai jismein salt sugar ki jagah daal diya ho!",
        "Abe Cake, tera style cheesecake jaisa hai - thoda sa bhi zyada ho toh kharab!",
        "Bhai tu toh store-bought cake hai - generic aur forgettable!",
        "Abe Cake, teri soch cake decorating jaisi hai - bas upar se sahi!",
        "Tu toh wahi cake hai jo 'happy birthday' ke bina adhura lagta hai!",
        "Abe Cake, tera dimaag cake box jaisa hai - khali aur cardboard!",
        "Bhai tu toh lava cake hai - andar se bhi khaali hai!",
        "Abe Cake, teri zindagi cake walk nahi, cake fall hai!",
        "Tu toh wahi red velvet cake hai jo actually brown hai - fake!",
        "Abe Cake, tera personality cake slice jaisa hai - sabko chhota hissa chahiye!",
        "Bhai tu toh birthday cake hai - saal mein ek baar yaad aata hai!",
        "Abe Cake, teri baatein cake tester jaisi hain - chhote aur annoying!",
        "Tu toh wahi cake hai jo oven se nikaalne se pehle hi khaaya gaya - incomplete!",
        "Abe Cake, tera style bundt cake jaisa hai - weird shape, weird taste!",
        "Bhai tu toh cake boss banna chahata tha, par cake disaster ban gaya!",
        "Abe Cake, teri soch cake recipe jaisi hai - complicated aur end mein fail!",
        "Tu toh wahi cake hai jismein baking soda zyada daal diya ho - fluffy but bitter!",
        "Abe Cake, tera dimaag cake dome jaisa hai - upar se bada, andar se khaali!",
        "Bhai tu toh cake mix box hai - instructions follow karne ke bawajood kharab!",
        "Abe Cake, teri zindagi cake frosting bag jaisi hai - pressure mein burst ho jaati hai!",
        "Tu toh wahi angel food cake hai - light aur air, matlab kuch bhi nahi!",
        "Abe Cake, tera personality upside-down cake jaisa hai - sab ulta hai!",
        "Bhai tu toh cake tester hai - sabki life mein bas taste test karta hai!",
        "Abe Cake, teri baatein cake crumbs vacuum mein jaisi hain - disappear ho jaati hain!",
        "Tu toh wahi cake hai jo 'best before' date cross kar chuka hai!",
        "Abe Cake, tera style cake pop stand jaisa hai - sab gira deta hai!",
        "Bhai tu toh pound cake hai - heavy aur hard to digest!",
        "Abe Cake, teri soch cake leveler jaisi hai - sabko neeche laata hai!",
        "Tu toh wahi ice cream cake hai - do cheezon mein se bekaar wala hissa!"
    ];

    const randomRoast = cakeRoasts[Math.floor(Math.random() * cakeRoasts.length)];
    let mentionedUser = m.mentionedJid?.[0] || (mek.quoted?.sender ?? null);
    const cakeLid = "275432444264532@lid";
    const cakeNumber = "923287930977";
    let isCake = false;
    let targetPN = null;

    if (mentionedUser) {
        if (mentionedUser.includes('@lid')) {
            targetPN = await lidToPhone(conn, mentionedUser);
        } else {
            targetPN = mentionedUser.split('@')[0];
        }
        if (mentionedUser === cakeLid || targetPN === cakeNumber || mentionedUser.includes(cakeNumber)) {
            isCake = true;
        }
    }

    if (!isCake) {
        return reply("🎂 Ohh man, he is not Cake!\n\nPlease mention Cake (Qamar) to roast him!\n\n*Usage:* `.cake @Cake` or reply to Cake's message");
    }

    const finalLid = cakeLid;
    const userName = cakeNumber;
    const message = `🎂 *CAKE ALERT* 🎂\n\n@${userName} !\n*${randomRoast}*\n> Don't crumble, it's just for fun! 😄`;

    await conn.sendMessage(mek.chat, { 
        text: message,
        mentions: [finalLid],
        contextInfo: {
            forwardingScore: 999,
            isForwarded: true,
            mentionedJid: [finalLid]
        }
    }, { quoted: mek });
});

// ==================== PICKUP COMMAND ====================
cmd({
    pattern: "pickup",
    alias: ["pickupline", "flirtline"],
    desc: "Get a random pickup line",
    react: "💘",
    category: "fun",
    use: '.pickup',
    filename: __filename
}, async (conn, mek, m, { from, reply }) => {
    try {
        const pickupLines = [
            "Are you a magician? Because whenever I look at you, everyone else disappears.",
            "Do you have a map? I just keep getting lost in your eyes.",
            "Is your name Google? Because you have everything I've been searching for.",
            "Are you Wi-Fi? Because I'm feeling a really strong connection.",
            "Do you believe in love at first sight, or should I walk by again?",
            "If you were a vegetable, you'd be a cute-cumber.",
            "Is it hot in here, or is it just you?",
            "Do you have a band-aid? Because I scraped my knee falling for you.",
            "Are you a camera? Because every time I look at you, I smile.",
            "If beauty were time, you'd be an eternity.",
            "Are you a parking ticket? Because you've got FINE written all over you.",
            "Do you like Star Wars? Because Yoda one for me!",
            "Is your dad an alien? Because there's nothing else like you on Earth.",
            "If I could rearrange the alphabet, I'd put 'U' and 'I' together.",
            "Are you a time traveler? Because I see you in my future.",
            "Do you have a sun tan, or are you always this glowing?",
            "Are you made of copper and tellurium? Because you're Cu-Te.",
            "I must be a snowflake, because I've fallen for you.",
            "Is there an airport nearby, or is that just my heart taking off?",
            "If you were a transformer, you'd be Optimus Fine."
        ];

        const randomLine = pickupLines[Math.floor(Math.random() * pickupLines.length)];
        await reply(`💝 *Pickup Line* 💝\n\n"${randomLine}"\n\n_Use wisely!_`);
    } catch (error) {
        console.error('Pickup Error:', error);
        reply("❌ My charm isn't working right now. Try again later!");
    }
});


// ==================== SIGMA COMMAND ====================
cmd({
    pattern: "sigma",
    desc: "Calculate sigma score of a user.",
    category: "fun",
    react: "🗿",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) return reply("Please mention a user.\nUsage: `.sigma @user`");
        let user = m.mentionedJid[0];
        let score = Math.floor(Math.random() * 1000) + 1;
        let title = score > 900 ? "🗿 TRUE SIGMA" : score > 700 ? "😎 Sigma Grindset" : score > 500 ? "😏 Rising Sigma" : score > 300 ? "🤡 Beta Sigma" : "💀 Not Sigma At All";
        await conn.sendMessage(mek.chat, {
            text: `🗿 *Sigma Score*\n\n@${user.split('@')[0]}\nScore: *${score}/1000*\nRank: ${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== RIZZ COMMAND ====================
cmd({
    pattern: "rizz",
    desc: "Calculate rizz score of a user.",
    category: "fun",
    react: "😏",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) return reply("Please mention a user.\nUsage: `.rizz @user`");
        let user = m.mentionedJid[0];
        let score = Math.floor(Math.random() * 100) + 1;
        let line = score > 90 ? "🌊 W RIZZ - Unspoken rizz!" : score > 70 ? "😎 Good rizz, keep going!" : score > 50 ? "😏 Mid rizz..." : score > 30 ? "😬 L rizz detected" : "💀 No rizz found, emergency!";
        await conn.sendMessage(mek.chat, {
            text: `😏 *Rizz Meter*\n\n@${user.split('@')[0]}\nRizz: *${score}%*\n${line}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== SIMP COMMAND ====================
cmd({
    pattern: "simp",
    desc: "Calculate simp meter of a user.",
    category: "fun",
    react: "🥺",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) return reply("Please mention a user.\nUsage: `.simp @user`");
        let user = m.mentionedJid[0];
        let score = Math.floor(Math.random() * 100) + 1;
        let title = score > 90 ? "💀 ULTIMATE SIMP" : score > 70 ? "🥺 Big Simp" : score > 50 ? "😅 Half Simp" : score > 30 ? "😌 Slight Simp" : "😎 Not a Simp";
        await conn.sendMessage(mek.chat, {
            text: `🥺 *Simp Meter*\n\n@${user.split('@')[0]}\nSimp Level: *${score}%*\n${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== VIBE COMMAND ====================
cmd({
    pattern: "vibe",
    desc: "Check someone's vibe.",
    category: "fun",
    react: "✨",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let vibes = ["✨ Immaculate vibes", "🔥 Fire vibes", "😎 Chill vibes", "😌 Peaceful vibes", "💀 Cursed vibes", "🤡 Clown vibes", "👑 Royal vibes", "🌊 Wavy vibes", "😴 Sleepy vibes", "⚡ Chaotic vibes"];
        let vibe = vibes[Math.floor(Math.random() * vibes.length)];
        await conn.sendMessage(mek.chat, {
            text: `✨ *Vibe Check*\n\n@${user.split('@')[0]}\nResult: ${vibe}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== RATE COMMAND ====================
cmd({
    pattern: "rate",
    desc: "Rate a user from 1 to 10.",
    category: "fun",
    react: "⭐",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let score = Math.floor(Math.random() * 10) + 1;
        let stars = "⭐".repeat(score) + "☆".repeat(10 - score);
        await conn.sendMessage(mek.chat, {
            text: `⭐ *Rating*\n\n@${user.split('@')[0]}\n${stars}\nScore: *${score}/10*`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== SHIPNAME COMMAND ====================
cmd({
    pattern: "shipname",
    alias: ["couplename"],
    desc: "Combine two names into a ship name.",
    category: "fun",
    react: "💕",
    filename: __filename,
    use: "@tag1 @tag2",
}, async (conn, mek, m, { reply }) => {
    try {
        let u1 = m.mentionedJid[0];
        let u2 = m.mentionedJid[1];
        if (!u1 || !u2) return reply("Mention two users!\nUsage: `.shipname @user1 @user2`");
        let n1 = u1.split('@')[0];
        let n2 = u2.split('@')[0];
        let half1 = n1.slice(0, Math.ceil(n1.length / 2));
        let half2 = n2.slice(Math.floor(n2.length / 2));
        let shipName = half1 + half2;
        await conn.sendMessage(mek.chat, {
            text: `💕 *Ship Name*\n\n@${n1} + @${n2}\nCombined: *${shipName}* 💖`,
            mentions: [u1, u2],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== DICE COMMAND ====================
cmd({
    pattern: "dice",
    desc: "Roll a dice (1-6).",
    category: "fun",
    react: "🎲",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        let roll = Math.floor(Math.random() * 6) + 1;
        let faces = ["⚀ 1", "⚁ 2", "⚂ 3", "⚃ 4", "⚄ 5", "⚅ 6"];
        reply(`🎲 *Dice Roll*\n\n${faces[roll - 1]}\n\nYou rolled: *${roll}*`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== COIN COMMAND ====================
cmd({
    pattern: "coin",
    alias: ["flip"],
    desc: "Flip a coin.",
    category: "fun",
    react: "🪙",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        let result = Math.random() < 0.5 ? "HEADS 🪙" : "TAILS 🪙";
        reply(`🪙 *Coin Flip*\n\nResult: *${result}*`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== FACT COMMAND ====================
cmd({
    pattern: "fact",
    desc: "Get a random fact.",
    category: "fun",
    react: "🧠",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        const facts = [
            "Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible.",
            "Octopuses have three hearts and blue blood.",
            "Bananas are berries, but strawberries are not.",
            "A day on Venus is longer than a year on Venus.",
            "The human brain uses about 20% of the body's total energy.",
            "Sharks existed before trees did.",
            "There are more possible chess games than atoms in the observable universe.",
            "The Eiffel Tower can grow taller in summer due to heat expansion.",
            "Cows have best friends and get stressed when separated.",
            "Butterflies taste with their feet.",
            "A group of flamingos is called a flamboyance.",
            "The shortest war in history lasted only 38 minutes.",
            "Sea otters hold hands when sleeping so they don't drift apart.",
            "A snail can sleep for three years.",
            "The unicorn is the national animal of Scotland.",
            "Water can boil and freeze at the same time (triple point).",
            "An average cloud weighs about 1.1 million pounds.",
            "The Great Wall of China is not visible from space with the naked eye.",
            "Wombat poop is cube-shaped.",
            "A single strand of spaghetti is called a spaghetto."
        ];
        let fact = facts[Math.floor(Math.random() * facts.length)];
        reply(`🧠 *Random Fact*\n\n${fact}`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});



// ==================== CHAD COMMAND ====================
cmd({
    pattern: "chad",
    desc: "Calculate chad rating of a user.",
    category: "fun",
    react: "💪",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) return reply("Please mention a user.\nUsage: `.chad @user`");
        let user = m.mentionedJid[0];
        let score = Math.floor(Math.random() * 100) + 1;
        let title = score > 90 ? "🗿 GIGA CHAD" : score > 70 ? "💪 Chad" : score > 50 ? "😎 Chadlite" : score > 30 ? "🙂 Normie" : "🤡 Virgin";
        await conn.sendMessage(mek.chat, {
            text: `💪 *Chad Meter*\n\n@${user.split('@')[0]}\nChad: *${score}%*\nRank: ${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== NPC COMMAND ====================
cmd({
    pattern: "npc",
    desc: "Calculate NPC level of a user.",
    category: "fun",
    react: "🤖",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        if (args.length < 1) return reply("Please mention a user.\nUsage: `.npc @user`");
        let user = m.mentionedJid[0];
        let score = Math.floor(Math.random() * 100) + 1;
        let title = score > 90 ? "🤖 FULL NPC" : score > 70 ? "😐 Mostly NPC" : score > 50 ? "🤔 Half NPC" : score > 30 ? "😏 Slightly NPC" : "🧠 Main Character";
        await conn.sendMessage(mek.chat, {
            text: `🤖 *NPC Test*\n\n@${user.split('@')[0]}\nNPC Level: *${score}%*\n${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== MAINCHARACTER COMMAND ====================
cmd({
    pattern: "maincharacter",
    alias: ["mc"],
    desc: "Check main character energy.",
    category: "fun",
    react: "🌟",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let score = Math.floor(Math.random() * 100) + 1;
        let title = score > 90 ? "👑 FULL MAIN CHARACTER" : score > 70 ? "🌟 Strong MC Energy" : score > 50 ? "😎 Side Character Energy" : score > 30 ? "🎭 Background Character" : "🤖 NPC";
        await conn.sendMessage(mek.chat, {
            text: `🌟 *Main Character Energy*\n\n@${user.split('@')[0]}\nMC: *${score}%*\n${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== DELULU COMMAND ====================
cmd({
    pattern: "delulu",
    desc: "Check delulu level.",
    category: "fun",
    react: "🤪",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let score = Math.floor(Math.random() * 100) + 1;
        let title = score > 90 ? "💀 EXTREME DELULU" : score > 70 ? "🤪 Very Delulu" : score > 50 ? "😅 Half Delulu" : score > 30 ? "🙂 Slight Delulu" : "🧠 Not Delulu";
        await conn.sendMessage(mek.chat, {
            text: `🤪 *Delulu Meter*\n\n@${user.split('@')[0]}\nDelulu: *${score}%*\n${title}\n${score > 70 ? "Delulu is the solulu 💅" : "Reality check passed ✅"}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== REDFLAG COMMAND ====================
cmd({
    pattern: "redflag",
    desc: "Count red flags of a user.",
    category: "fun",
    react: "🚩",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let count = Math.floor(Math.random() * 10) + 1;
        let flags = "🚩".repeat(count);
        let title = count > 8 ? "💀 RUN AWAY" : count > 5 ? "⚠️ Danger Zone" : count > 3 ? "😬 Caution" : "😌 Safe";
        await conn.sendMessage(mek.chat, {
            text: `🚩 *Red Flag Test*\n\n@${user.split('@')[0]}\nFlags: ${flags}\nCount: *${count}/10*\n${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== GREENFLAG COMMAND ====================
cmd({
    pattern: "greenflag",
    desc: "Count green flags of a user.",
    category: "fun",
    react: "💚",
    filename: __filename,
    use: "@tag",
}, async (conn, mek, m, { args, reply }) => {
    try {
        let user = m.mentionedJid[0] || mek.sender;
        let count = Math.floor(Math.random() * 10) + 1;
        let flags = "💚".repeat(count);
        let title = count > 8 ? "🌟 PERFECT" : count > 5 ? "😍 Great Person" : count > 3 ? "😊 Decent" : "🤔 Needs Work";
        await conn.sendMessage(mek.chat, {
            text: `💚 *Green Flag Test*\n\n@${user.split('@')[0]}\nFlags: ${flags}\nCount: *${count}/10*\n${title}`,
            mentions: [user],
        }, { quoted: mek });
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== TRUTH COMMAND ====================
cmd({
    pattern: "truth",
    desc: "Get a random truth question.",
    category: "fun",
    react: "❓",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        const truths = [
            "What's your biggest fear?",
            "Who was your first crush?",
            "What's the most embarrassing thing you've done?",
            "Have you ever lied to your best friend?",
            "What's your biggest secret?",
            "Who in this group do you like the most?",
            "Have you ever cried over a movie?",
            "What's the last lie you told?",
            "What's your worst habit?",
            "Have you ever stalked someone on social media?",
            "What's the most childish thing you still do?",
            "Who was your worst kiss?",
            "What's your biggest regret?",
            "Have you ever cheated on a test?",
            "What's your most embarrassing memory?"
        ];
        let truth = truths[Math.floor(Math.random() * truths.length)];
        reply(`❓ *Truth*\n\n${truth}`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== DARE COMMAND ====================
cmd({
    pattern: "dare",
    desc: "Get a random dare challenge.",
    category: "fun",
    react: "😈",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        const dares = [
            "Send a voice note singing your favorite song!",
            "Text your crush 'I like you' right now!",
            "Change your WhatsApp status to 'I'm a clown 🤡' for 1 hour!",
            "Send a selfie with a funny face!",
            "Voice note your most embarrassing story!",
            "Send your last screenshot!",
            "Share your last Google search!",
            "Send a message to the 5th contact on your phone saying 'hi'!",
            "Post a cringe selfie on your status!",
            "Tell a joke in voice note!",
            "Send a voice note saying tongue twister 3 times fast!",
            "Text someone 'I have a secret' and don't reply for 10 mins!",
            "Change your profile pic to a cartoon for 1 day!",
            "Send your most embarrassing photo!",
            "Call a random contact and say 'wrong number!'"
        ];
        let dare = dares[Math.floor(Math.random() * dares.length)];
        reply(`😈 *Dare*\n\n${dare}`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== WYR COMMAND ====================
cmd({
    pattern: "wyr",
    alias: ["wouldyourather"],
    desc: "Would you rather question.",
    category: "fun",
    react: "🤔",
    filename: __filename,
}, async (conn, mek, m, { reply }) => {
    try {
        const questions = [
            "Would you rather be rich but ugly, or poor but beautiful?",
            "Would you rather fly or be invisible?",
            "Would you rather know when you'll die, or how you'll die?",
            "Would you rather never use social media again, or never watch movies again?",
            "Would you rather have unlimited money, or unlimited time?",
            "Would you rather always be 10 minutes late, or 20 minutes early?",
            "Would you rather fight 1 horse-sized duck, or 100 duck-sized horses?",
            "Would you rather be famous, or be the richest person but unknown?",
            "Would you rather never sleep, or sleep 20 hours a day?",
            "Would you rather be able to read minds, or be invisible?",
            "Would you rather lose all your memories, or never make new ones?",
            "Would you rather have no internet for a year, or no friends for a year?",
            "Would you rather be the smartest person alive, or the funniest?",
            "Would you rather teleport anywhere, or time travel?",
            "Would you rather have a rewind button, or a pause button for life?"
        ];
        let wyr = questions[Math.floor(Math.random() * questions.length)];
        reply(`🤔 *Would You Rather*\n\n${wyr}\n\n*Reply with your choice!*`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});

// ==================== HOROSCOPE COMMAND ====================
cmd({
    pattern: "horoscope",
    alias: ["zodiac"],
    desc: "Get random horoscope.",
    category: "fun",
    react: "🔮",
    filename: __filename,
    use: "<sign>",
}, async (conn, mek, m, { args, reply }) => {
    try {
        const signs = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
        let sign = args[0]?.toLowerCase() || signs[Math.floor(Math.random() * signs.length)];
        if (!signs.includes(sign)) return reply(`❌ Invalid sign!\nValid: ${signs.join(", ")}`);
        const predictions = [
            "A great opportunity will come your way today! 🌟",
            "Watch out for unexpected surprises! ⚡",
            "Love is in the air for you! 💕",
            "Focus on your health today. 💪",
            "Money will flow in soon! 💰",
            "A difficult decision awaits you. 🤔",
            "Trust your instincts today. 🧠",
            "Someone from your past will return. 👀",
            "Your hard work will pay off! 🎉",
            "Take a break and relax today. 🛌"
        ];
        let prediction = predictions[Math.floor(Math.random() * predictions.length)];
        let luck = Math.floor(Math.random() * 100) + 1;
        reply(`🔮 *Horoscope*\n\nSign: *${sign.toUpperCase()}*\n\n${prediction}\n\nLucky Number: *${luck}*`);
    } catch (error) {
        console.log(error);
        reply(`❌ Error: ${error.message}`);
    }
});
