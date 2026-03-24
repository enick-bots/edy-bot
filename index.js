const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot online!');
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Servidor de salud escuchando en el puerto ${PORT}`);
});

require('dotenv').config();
// --- IMPORTACIONES ÚNICAS ---
const { 
    Client, 
    GatewayIntentBits, 
    Collection, 
    Events, 
    Partials, 
    EmbedBuilder, 
    ActionRowBuilder, 
    ButtonBuilder, 
    ButtonStyle, 
    ComponentType 
} = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('./db.js');
const { activeGames } = require('./slash/imposter.js'); // Importación del juego

const { commandPermissions } = db;

// CONFIGURACIÓN DE SEGURIDAD GLOBAL
const DEVELOPERS = ['1442784860170096711']; // <--- CAMBIA ESTO POR TU ID
const ADMIN_PREFIX_COMMANDS = ['config', 'tag'];
const ADMIN_SLASH_COMMANDS = ['dar-spins', 'quitar-spins', 'dar-coins', 'quitar-coins', 'admin', 'radmin'];

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();
const prefixes = ["Jarvis ", "Jarvis", "edy ", "Edy ", "edy", "Edy", ".", "Yarvis ", "Yarvis"];

// CARGA DE COMANDOS
const loadCommands = (dir) => {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
        const files = fs.readdirSync(fullPath).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const command = require(path.join(fullPath, file));
            const name = command.name || (command.data && command.data.name);
            if (name) client.commands.set(name.toLowerCase(), command);
        }
    }
};

loadCommands('commands');
loadCommands('slash');

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

// EVENTO: BIENVENIDA
client.on(Events.GuildCreate, async (guild) => {
    const channel = guild.channels.cache.find(c => c.type === 0 && c.permissionsFor(guild.members.me).has('SendMessages'));
    if (channel) {
        const welcome = new EmbedBuilder()
            .setTitle("Hola, soy Eduardo BS un bot hecho por e_rcju")
            .setDescription(`Saludos, soy **${client.user.username}**. He sido desplegado en **${guild.name}**.\n\nAdministradores, contacten al desarrollador para configurar el mando con \`/admin\`. Para saber más pueden usar .help`)
            .setColor("#2b2d31")
            .setThumbnail(client.user.displayAvatarURL());
        channel.send({ embeds: [welcome] });
    }
});

// EVENTO: INTERACCIONES (SLASH)
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    if (ADMIN_SLASH_COMMANDS.includes(interaction.commandName)) {
        const isDev = DEVELOPERS.includes(interaction.user.id);
        const serverConfig = db.configDB[interaction.guild.id];
        const hasAdminRole = serverConfig?.adminRole && interaction.member.roles.cache.has(serverConfig.adminRole);
        if (!isDev && !hasAdminRole) return interaction.reply({ content: "Protocolo restringido.", ephemeral: true });
    }

    try { await command.execute(interaction, db); } catch (error) {
        console.error(error);
        if (!interaction.replied) await interaction.reply({ content: 'Fallo interno.', ephemeral: true });
    }
});

// EVENTO: MENSAJES (PREFIJOS Y JUEGO IMPOSTOR)
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot || !message.guild) return;

    // --- LÓGICA DEL JUEGO IMPOSTOR ---
    const game = activeGames.get(message.channelId);
    if (game) {
        const isHost = message.author.id === game.host.id;

        if (message.content === '.stop' && isHost) {
            const embed = new EmbedBuilder()
                .setTitle("⚠️ Confirmar finalización")
                .setDescription("¿Seguro que quieres terminar la partida?")
                .setColor(0xff0000);
            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('confirm_stop').setLabel('Sí, terminar').setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId('cancel_stop').setLabel('Cancelar').setStyle(ButtonStyle.Secondary)
            );
            const msg = await message.reply({ embeds: [embed], components: [row] });
            const collector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 15000 });
            collector.on('collect', async (i) => {
                if (i.user.id !== message.author.id) return i.reply({ content: "Solo el host puede usar esto.", ephemeral: true });
                if (i.customId === 'confirm_stop') {
                    activeGames.delete(message.channelId);
                    await i.update({ embeds: [new EmbedBuilder().setTitle("🛑 Partida terminada").setColor(0x2b2d31)], components: [] });
                } else {
                    await i.update({ content: "❌ Cancelado.", embeds: [], components: [] });
                }
                collector.stop();
            });
            return;
        }

        if (message.content === '.reveal' && isHost && game.started) {
            const imps = game.imposterIds.map(id => `<@${id}>`).join('\n') || "Nadie";
            const embed = new EmbedBuilder().setTitle("📢 FIN DEL JUEGO").setColor(0x00aaff)
                .addFields({ name: "👺 Impostores", value: imps }, { name: "🔑 Palabra", value: `**${game.word}**` });
            activeGames.delete(message.channelId);
            return message.reply({ embeds: [embed] });
        }

        if (message.content.startsWith('.kick') && isHost) {
            const target = message.mentions.users.first();
            if (!target) return message.reply("⚠️ Menciona a alguien.");
            if (!game.isPlayer(target.id)) return message.reply("❌ No está en la partida.");
            game.banPlayer(target.id);
            return message.reply(`👞 **${target.username}** fue expulsado.`);
        }
    }

    // --- LÓGICA DE COMANDOS ---
    const contentLower = message.content.toLowerCase();
    const prefix = prefixes.find(p => contentLower.startsWith(p.toLowerCase()));

    if (prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (command) {
            const isDev = DEVELOPERS.includes(message.author.id);
            const isOwner = message.author.id === message.guild.ownerId;
            const serverConfig = db.configDB[message.guild.id];
            const hasAdminRole = serverConfig?.adminRole && message.member.roles.cache.has(serverConfig.adminRole);

            if (ADMIN_PREFIX_COMMANDS.includes(command.name.toLowerCase()) && !isDev && !isOwner && !hasAdminRole) {
                return message.reply("Acceso denegado.");
            }

            try {
                const user = db.getUser(message.author.id);
                return await command.execute(message, args, user, db);
            } catch (error) {
                console.error(error);
                return message.channel.send("Fallo en sistemas internos.");
            }
        }
    }

    // Respuestas automáticas
    if (message.mentions.users.has(client.user.id) && !message.reference) return message.reply("bro encuerate y manda foto 👀");
    const gatillos = ["q", "que", "k", "ke"];
    if (gatillos.includes(message.content.toLowerCase().trim())) {
        const emojiServidor = message.guild.emojis.cache.find(e => e.name === 'fangato');
        return message.reply(emojiServidor ? `so ${emojiServidor}` : "so 🧀");
    }
});

// EVENTOS DE SNIPES (BORRADOS Y EDICIONES)
client.on('messageDelete', async (message) => {
    if (message.author?.bot || !message.guild) return;
    const reacciones = message.reactions.cache.map(r => {
        const usuarios = r.users.cache.filter(u => !u.bot).map(u => `<@${u.id}>`).join(', ');
        return usuarios ? `${usuarios} reaccionaron con ${r.emoji}` : null;
    }).filter(r => r !== null);

    let channelSnipes = db.snipes.get(message.channel.id) || [];
    channelSnipes.unshift({
        content: message.content || "Mensaje sin texto",
        author: message.author,
        reacciones: reacciones.join('\n') || "Nadie reaccionó",
        timestamp: new Date(),
        image: message.attachments.first()?.proxyURL || null
    });
    if (channelSnipes.length > 7) channelSnipes.pop();
    db.snipes.set(message.channel.id, channelSnipes);
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;
    let channelEsnipes = db.esnipes.get(oldMsg.channel.id) || [];
    channelEsnipes.unshift({ type: 'edit', oldContent: oldMsg.content, newContent: newMsg.content, author: oldMsg.author, timestamp: new Date() });
    if (channelEsnipes.length > 7) channelEsnipes.pop();
    db.esnipes.set(oldMsg.channel.id, channelEsnipes);
});

// HISTORIAL DE REACCIONES ELIMINADAS
client.on('messageReactionRemove', async (reaction, user) => {
    if (user.bot) return;
    if (reaction.partial) { try { await reaction.fetch(); } catch (e) { return; } }

    const channelId = reaction.message.channel.id;
    let history = db.esnipes.get(channelId + "_reac_history") || [];

    let msgEntry = history.find(m => m.id === reaction.message.id);
    if (!msgEntry) {
        msgEntry = { id: reaction.message.id, author: reaction.message.author, content: reaction.message.content || "Mensaje (emoji/archivo)", users: [] };
        history.unshift(msgEntry);
    }

    const yaExiste = msgEntry.users.some(u => u.id === user.id && u.emoji === reaction.emoji.toString());
    if (!yaExiste) msgEntry.users.push({ id: user.id, emoji: reaction.emoji.toString() });

    if (history.length > 10) history.pop();
    db.esnipes.set(channelId + "_reac_history", history);
});

client.login(process.env.TOKEN);