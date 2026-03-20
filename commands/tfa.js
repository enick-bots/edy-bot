const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'tfa',
    async execute(message, args) {
        // Buscamos al mencionado o al autor
        const target = message.mentions.users.first() || message.author;
        
        // Generamos el porcentaje
        const porcentaje = Math.floor(Math.random() * 101);
        
        // La URL de tu imagen
        const urlImagen = 'https://i.postimg.cc';

        // Creamos el Embed con el título que pediste
        const embed = new EmbedBuilder()
            .setTitle(`Atrocidad de ${target.username}`)
            .setImage(urlImagen)
            .setColor('#ff0000'); // Rojo atrocidad

        // Enviamos la mención, el porcentaje y el embed
        message.reply({ 
            content: `${target} **${porcentaje}%**, ¡te falta atrocidad!`, 
            embeds: [embed] 
        });
    }
};
