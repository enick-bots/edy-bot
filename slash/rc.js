const { SlashCommandBuilder } = require('discord.js');
const db = require('../db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quitar-coins')
        .setDescription('Resta monedas a un usuario')
        .addUserOption(o => o.setName('usuario').setDescription('Usuario afectado').setRequired(true))
        .addIntegerOption(o => o.setName('cantidad').setDescription('Monto').setRequired(true)),
    async execute(interaction) {
        const rolStaff = 'ID_DE_TU_ROL';
        if (!interaction.member.roles.cache.has(rolStaff)) {
            return interaction.reply({ content: 'No tienes permiso', ephemeral: true });
        }

        const target = interaction.options.getUser('usuario');
        const amount = interaction.options.getInteger('cantidad');
        const userData = db.getUser(target.id);

        userData.coins = Math.max(0, userData.coins - amount);
        db.saveAll();

        await interaction.reply({ content: `Se retiraron ${amount} monedas a ${target.username}. total: ${userData.coins}` });
    },
};
