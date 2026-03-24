const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dar-coins')
        .setDescription('Suma monedas a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Destinatario').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto').setRequired(true)),

    async execute(interaction) {
        const rolesStaff = ['1413905048878059682', '1417609503934775397', "1436875228339765381", "1432583674683195432","819610352111190077","1436489760674938960","1408296046873808917","1408295542232055808"];
        
        // FIX: Verificar si tiene AL MENOS UNO de los roles de la lista
        if (!interaction.member.roles.cache.some(role => rolesStaff.includes(role.id))) {
            return interaction.reply({ content: '❌ No tienes permiso para usar este comando.', flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const userData = db.getUser(target.id);

        userData.coins += amount;
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('💰 Monedas Entregadas')
            .setDescription(`Se han sumado **${amount}** ${db.emoji} a ${target}.\nAhora tiene: **${userData.coins}** ${db.emoji}`)
            .setColor('#57F287')
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
