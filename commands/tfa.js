const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tfa',
    async execute(message, args) {
        // Buscamos al mencionado o al autor
        const target = message.mentions.users.first() || message.author;
        
        // Generamos el porcentaje aleatorio
        const porcentaje = Math.floor(Math.random() * 101);
        
        // --- PEGA TU URL AQUÍ ---
        const urlImagen = 'https://i.postimg.cc'; 

        // Creamos el Embed
        const embed = new EmbedBuilder()
            .setTitle(`Atrocidad de ${target.username}`)
            .setDescription(`${target} tiene un **${porcentaje}%** de atrocidad.`)
            .setImage("https://cdn.discordapp.com/attachments/1478194714497912832/1479566418335895552/Screenshot_20260121_133651_TikTok.jpg?ex=69bef61b&is=69bda49b&hm=b5fd9a2d8438e2ffd8f335145385a15f7f761743571bd4192adca93b0d34ee9c&") // Aquí se muestra la imagen grande
            .setColor('#ff0000') // Rojo
            .setTimestamp() // Opcional: añade la hora actual
            .setFooter({ text: ' Atrocidad de', iconURL: message.client.user.displayAvatarURL() });

        // Enviamos la respuesta
        message.channel.send({
            embeds: [embed] 
        });
    }
};
