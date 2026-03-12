const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dar-spins')
        .setDescription('Otorga tiradas gratis de slot a un usuario')
        .addUserOption(opt => opt.setName('usuario').setDescription('Usuario').setRequired(true))
        .addIntegerOption(opt => opt.setName('cantidad').setDescription('Monto').setRequired(true)),
    async execute(interaction) {
   
        const staffRoleId = 'ID_DE_TU_ROL'; 
        
        if (!interaction.member.roles.cache.has(staffRoleId)) {
            return interaction.reply({ 
                content: "No tienes permiso", 
                ephemeral: true 
            });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');

        if (amount <= 0) return interaction.reply({ content: "Monto invalido", ephemeral: true });

        const user = db.getUser(target.id);
        user.spins += amount;
        db.saveAll(); 

        const embed = new EmbedBuilder()
            .setTitle('Tiradas de Regalo')
            .setDescription(`Se agregaron ${amount} tiradas gratis a ${target.username}`)
            .setColor(0x000000) 
            .addFields(
                { name: 'Tiradas totales', value: `${user.spins}`, inline: true },
                { name: 'Saldo coins', value: `${user.coins}`, inline: true }
            )
            .setFooter({ text: `Admin: ${interaction.user.username}` });

        await interaction.reply({ embeds: [embed] });
    },
};
