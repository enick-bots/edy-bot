const { EmbedBuilder } = require('discord.js');
const db = require('../db.js');
const ms = require('ms');

let enUso = false;
const cooldowns = new Map(); 
const contadorUsos = new Map();

module.exports = {
    name: "tag",
    aliases: ["taguear", "ping"],
    async execute(message, args) {
        // Manejo de la configuración (.tag config ...)
        if (args[0] === 'config') {
            if (!message.member.permissions.has('Administrator')) return message.reply("Solo admins pa");

            const input = args.slice(1).join(' ');
            if (!input) {
                const helpEmbed = new EmbedBuilder()
                    .setTitle('⚙️ Panel de Configuración: .tag')
                    .setColor('#2f3136')
                    .addFields(
                        { name: 'Cooldown (cd)', value: `\`${db.configDB.cooldown}\``, inline: true },
                        { name: 'Max Tags', value: `\`${db.configDB.max_tags}\``, inline: true },
                        { name: 'Max Usos (use)', value: `\`${db.configDB.use_max}\``, inline: true }
                    )
                    .setFooter({ text: 'Uso: .tag config cd:5m max_tags:50 max_use:10' });
                return message.reply({ embeds: [helpEmbed] });
            }

            // Detectar valores en el texto (Regex)
            const cdMatch = input.match(/cd:(\w+)/);
            const tagsMatch = input.match(/max_tags:(\d+)/);
            const useMatch = input.match(/max_use:(\d+)/);

            if (cdMatch) db.configDB.cooldown = cdMatch[1];
            if (tagsMatch) db.configDB.max_tags = parseInt(tagsMatch[1]);
            if (useMatch) db.configDB.use_max = parseInt(useMatch[1]);

            // GUARDAR EN JSON
            db.saveAll();

            return message.reply(`⚙️ configuracion actualizada:\n- CD: \`${db.configDB.cooldown}\`\n- Max Tags: \`${db.configDB.max_tags}\`\n- Max Use: \`${db.configDB.use_max}\``);
        }

        // Lógica normal de tagueo
        const maxPermitidos = db.configDB.max_tags || 20;
        const maxUsosPorPersona = db.configDB.use_max || 5;
        const waitTime = ms(db.configDB.cooldown || "10s");
        const userId = message.author.id;

        if (cooldowns.has(userId)) {
            const exp = cooldowns.get(userId) + waitTime;
            if (Date.now() < exp) return message.reply(`Tranquilo, espera ${ms(exp - Date.now(), { long: true })}.`);
        }

        let usosActuales = contadorUsos.get(userId) || 0;
        if (usosActuales >= maxUsosPorPersona && !message.member.permissions.has('Administrator')) {
            return message.reply(`Ya agotaste tus ${maxUsosPorPersona} usos permitidos.`);
        }

        if (enUso) return message.reply("El bot ya esta haciendo tags a alguien mas.");

        const cantidad = parseInt(args[0]);
        const target = message.mentions.users.first();

        if (isNaN(cantidad) || !target) return message.reply("Uso: .tag <cantidad> <@user>");
        if (cantidad > maxPermitidos) return message.reply(`El limite es de ${maxPermitidos} tags.`);

        enUso = true;
        cooldowns.set(userId, Date.now());
        contadorUsos.set(userId, usosActuales + 1);

        const status = await message.channel.send(`Tagueando a ${target.username}...`);

        for (let i = 0; i < cantidad; i++) {
            try {
                const t = await message.channel.send(`${target}`);
                await t.delete().catch(() => null);
                await new Promise(r => setTimeout(r, 1000)); 
            } catch (err) { break; }
        }

        enUso = false;
        return status.edit(`⚙️ Tags terminados para ${target.username}.`);
    }
};
