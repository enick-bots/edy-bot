const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('radmin')
        .setDescription('Revoca el acceso del rol de mando en este servidor'),

    async execute(interaction, db) {
        // RESTRICCIÓN: Solo tú (el Desarrollador) puedes usar esto
        const DEVELOPERS = ['1442784860170096711']; // <--- PON TU ID AQUÍ
        if (!DEVELOPERS.includes(interaction.user.id)) {
            return interaction.reply({ 
                content: "⚠️ Acceso denegado: Solo el Desarrollador Principal puede revocar mandos globales.", 
                ephemeral: true 
            });
        }

        // Verificar si existe una configuración para este servidor
        if (!db.configDB[interaction.guild.id] || !db.configDB[interaction.guild.id].adminRole) {
            return interaction.reply({ 
                content: "Este servidor no tiene un rol de mando configurado actualmente.", 
                ephemeral: true 
            });
        }

        // Obtener el ID del rol antes de borrarlo para el mensaje
        const oldRoleId = db.configDB[interaction.guild.id].adminRole;

        // Borrar el rol de la base de datos
        delete db.configDB[interaction.guild.id].adminRole;
        
        // Guardar cambios en el archivo JSON
        db.saveAll();

        const revokeEmbed = new EmbedBuilder()
            .setTitle("❌ Protocolo de Mando Revocado")
            .setDescription(`Se ha eliminado el acceso administrativo para el rol con ID: \`${oldRoleId}\`.`)
            .addFields({ 
                name: "Estado de Sistemas", 
                value: "Los comandos `gc`, `gs`, `troll`, `cb` y de gestión de monedas han sido bloqueados para los usuarios de este servidor." 
            })
            .setColor("#ff0000")
            .setFooter({ text: "Jarvis System | Seguridad" })
            .setTimestamp();

        return interaction.reply({ embeds: [revokeEmbed] });
    }
};