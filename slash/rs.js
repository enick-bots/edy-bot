const { SlashCommandBuilder, EmbedBuilder, MessageFlags } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitar-spins')
        .setDescription('Retira tiradas gratis a un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Monto').setRequired(true)),

    async execute(interaction) {
        const rolesStaff = ['1413905048878059682', '1417609503934775397', "1436875228339765381", "1432583674683195432"];
        
        if (!interaction.member.roles.cache.some(role => rolesStaff.includes(role.id))) {
            return interaction.reply({ content: "❌ No tienes permiso.", flags: [MessageFlags.Ephemeral] });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const user = db.getUser(target.id);

        user.spins = Math.max(0, user.spins - amount);
        db.saveAll(); 

        const embed = new EmbedBuilder()
            .setTitle('🌀 Tiradas Retiradas')
            .setDescription(`Se quitaron **${amount}** tiradas a ${target}`)
            .setColor('#ED4245') 
            .addFields(
                { name: 'Tiradas restantes', value: `${user.spins} 🌀`, inline: true }
            )
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
