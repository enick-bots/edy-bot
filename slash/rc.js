const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitar-coins')
        .setDescription('Resta monedas a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario afectado').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto').setRequired(true)),

    async execute(interaction) {
        const rolesStaff = ['1413905048878059682', '1417609503934775397', "1436875228339765381", "1432583674683195432"];
        
        // Verificamos si tiene al menos uno de los roles
        if (!interaction.member.roles.cache.some(role => rolesStaff.includes(role.id))) {
            return interaction.reply({ content: '❌ No tienes permiso.', flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const userData = db.getUser(target.id);

        // Math.max(0, ...) evita que el saldo quede en números negativos
        userData.coins = Math.max(0, userData.coins - amount);
        db.saveAll();

        const embed = new EmbedBuilder()
            .setTitle('📉 Monedas Retiradas')
            .setDescription(`Se han quitado **${amount}** ${db.emoji} a ${target}.\nSaldo actual: **${userData.coins}** ${db.emoji}`)
            .setColor('#ED4245') // Rojo para indicar resta
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
