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
const { Client, GatewayIntentBits, Collection, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

// --- CORRECCIÓN DE IMPORTACIÓN ---
const db = require('./db.js'); 
const { commandPermissions, snipes, esnipes } = db; 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

client.commands = new Collection();
const prefixes = ["Jarvis ", "Jarvis", "edy ", "Edy ", "edy", "Edy", "."];

// Cargar comandos de prefijo
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
    const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        if ('name' in command) client.commands.set(command.name, command);
    }
}

// Cargar Slash Commands
const slashPath = path.join(__dirname, 'slash');
if (fs.existsSync(slashPath)) {
    const slashFiles = fs.readdirSync(slashPath).filter(file => file.endsWith('.js'));
    for (const file of slashFiles) {
        const command = require(path.join(slashPath, file));
        if (command.data && command.data.name) client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`Bot listo como ${client.user.tag}`);
});

// Eventos de Snipe
client.on('messageDelete', (message) => {
    if (message.author?.bot || !message.guild) return;
    let channelSnipes = snipes.get(message.channel.id) || [];
    channelSnipes.unshift({
        content: message.content || "Mensaje sin texto",
        author: message.author,
        timestamp: message.createdAt,
        image: message.attachments.first()?.proxyURL || null
    });
    if (channelSnipes.length > 7) channelSnipes.pop();
    snipes.set(message.channel.id, channelSnipes);
});

client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.author?.bot || !oldMsg.guild || oldMsg.content === newMsg.content) return;
    let channelEsnipes = esnipes.get(oldMsg.channel.id) || [];
    channelEsnipes.unshift({
        oldContent: oldMsg.content || "Sin texto",
        newContent: newMsg.content || "Sin texto",
        author: oldMsg.author,
        timestamp: new Date()
    });
    if (channelEsnipes.length > 7) channelEsnipes.pop();
    esnipes.set(oldMsg.channel.id, channelEsnipes);
});

// --- ÚNICO EVENTO DE INTERACCIÓN ---
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    // Obtenemos el usuario de la DB antes de ejecutar
    const user = db.getUser(interaction.user.id); 

    try {
        // Pasamos interaction, user y db al comando
        await command.execute(interaction, user, db);
    } catch (error) {
        console.error(error);
        const errorMsg = { content: 'Hubo un error al ejecutar el comando.', flags: [MessageFlags.Ephemeral] };
        if (interaction.replied || interaction.deferred) await interaction.followUp(errorMsg);
        else await interaction.reply(errorMsg);
    }
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const contentLower = message.content.toLowerCase();
    const prefix = prefixes.find(p => contentLower.startsWith(p.toLowerCase()));
    
    if (prefix) {
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase();

        if (commandName) {
            const command = client.commands.get(commandName) || 
                            client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

            if (command) {
                const requiredRoleId = commandPermissions.get(command.name);
                if (requiredRoleId && !message.member.roles.cache.has(requiredRoleId)) {
                    return message.reply("No tienes el rol necesario.");
                }
                try {
                    // Para comandos de prefijo, podrías necesitar pasar db y user también:
                    const user = db.getUser(message.author.id);
                    return await command.execute(message, args, user, db);
                } catch (error) {
                    console.error(error);
                    return message.reply("Hubo un error al ejecutar este comando.");
                }
            }
        }
    }

  if (message.mentions.users.has('1292577920149360690') && !message.reference) {
    return message.reply("bro encuerate y manda foto 👀");
}


    const gatillos = ["q", "que", "k", "ke"];
    if (gatillos.includes(message.content.toLowerCase().trim())) {
        const emojiServidor = message.guild.emojis.cache.find(e => e.name === 'fangato');
        return message.reply(emojiServidor ? `so ${emojiServidor}` : "so 🧀");
    }
});
<<<<<<< HEAD
=======
const { activeGames } = require('./slash/imposter.js');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const game = activeGames.get(message.channelId);
    if (!game) return;

    const isHost = message.author.id === game.host.id;

    // =========================
    // 🛑 .stop (CONFIRMACIÓN)
    // =========================
    if (message.content === '.stop') {
        if (!isHost) {
            return message.reply("❌ Solo el host puede detener la partida.");
        }

        const embed = new EmbedBuilder()
            .setTitle("⚠️ Confirmar finalización")
            .setDescription("¿Seguro que quieres terminar la partida?\n\nEsta acción no se puede deshacer.")
            .setColor(0xff0000);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirm_stop')
                .setLabel('Sí, terminar')
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId('cancel_stop')
                .setLabel('Cancelar')
                .setStyle(ButtonStyle.Secondary)
        );

        const msg = await message.reply({ embeds: [embed], components: [row] });

        const collector = msg.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000
        });

        collector.on('collect', async (i) => {
            if (i.user.id !== message.author.id) {
                return i.reply({ content: "❌ Solo el host puede usar esto.", ephemeral: true });
            }

            if (i.customId === 'confirm_stop') {
                activeGames.delete(message.channelId);

                await i.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle("🛑 Partida terminada")
                            .setDescription("El host ha finalizado la partida.")
                            .setColor(0x2b2d31)
                    ],
                    components: []
                });

                collector.stop();
            }

            if (i.customId === 'cancel_stop') {
                await i.update({
                    content: "❌ Cancelado.",
                    embeds: [],
                    components: []
                });

                collector.stop();
            }
        });

        collector.on('end', async () => {
            try {
                await msg.edit({ components: [] });
            } catch {}
        });
    }

    // =========================
    // 📢 .reveal (EMBED)
    // =========================
    if (message.content === '.reveal') {
        if (!isHost) {
            return message.reply("❌ Solo el host puede revelar.");
        }

        if (!game.started) {
            return message.reply("⚠️ El juego aún no ha comenzado.");
        }

        const imps = game.imposterIds.map(id => `<@${id}>`).join('\n') || "Nadie";

        const embed = new EmbedBuilder()
            .setTitle("📢 FIN DEL JUEGO")
            .setColor(0x00aaff)
            .addFields(
                { name: "👺 Impostores", value: imps },
                { name: "🔑 Palabra", value: `**${game.word}**` }
            )
            .setFooter({ text: "Gracias por jugar 😈" })
            .setTimestamp();

        activeGames.delete(message.channelId);

        return message.reply({ embeds: [embed] });
    }

    // =========================
    // 👞 .kick
    // =========================
    if (message.content.startsWith('.kick')) {
        if (!isHost) {
            return message.reply("❌ Solo el host puede expulsar.");
        }

        const target = message.mentions.users.first();

        if (!target) {
            return message.reply("⚠️ Menciona a alguien.");
        }

        if (!game.isPlayer(target.id)) {
            return message.reply("❌ No está en la partida.");
        }

        if (target.id === game.host.id) {
            return message.reply("❌ No puedes expulsarte.");
        }

        game.banPlayer(target.id);

        return message.reply(`👞 **${target.username}** fue expulsado.`);
    }
});

>>>>>>> 94aea9829507e3a6eb933e5a1bd81f375057c0fb

client.login(process.env.TOKEN);
