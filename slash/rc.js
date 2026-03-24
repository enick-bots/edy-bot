const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitar-coins')
        .setDescription('Resta monedas a un usuario (permite deuda)')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario afectado').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto a restar').setRequired(true)),

    async execute(interaction) {
        const rolesStaff = ['1413905048878059682', '1417609503934775397', "1436875228339765381", "1432583674683195432","819610352111190077","1436489760674938960","1408296046873808917","1408295542232055808"];
        
        if (!interaction.member.roles.cache.some(role => rolesStaff.includes(role.id))) {
            return interaction.reply({ content: '❌ No tienes permiso.', flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const userData = db.getUser(target.id);

        // Eliminamos Math.max para que el saldo PUEDA ser negativo
        userData.coins -= amount; 
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('📉 Monedas Retiradas')
            .setDescription(`Se han quitado **${amount}** ${db.emoji} a ${target}.\n\n` + 
                            `💰 Saldo actual: **${userData.coins}** ${db.emoji}\n` +
                            `${userData.coins < 0 ? '⚠️ *Este usuario ahora tiene una deuda.*' : ''}`)
            .setColor('#ED4245')
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
