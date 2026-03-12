const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
    name: 'tfa',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const porcentaje = Math.floor(Math.random() * 101);
        
        // Creamos el lienzo
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');

        try {
            // Cargamos tu imagen directamente desde la URL que pasaste
            const imgAtrocidad = await loadImage('https://i.ibb.co/Hjw2Fcq/Screenshot-20260121-133651-Tik-Tok.webp');
            
            // Dibujamos la imagen de fondo
            ctx.drawImage(imgAtrocidad, 0, 0, 500, 500); 

            // Configuración del texto del porcentaje
            ctx.font = 'bold 80px sans-serif';
            ctx.fillStyle = '#ff0000'; 
            ctx.textAlign = 'center';
            
            // Borde negro al texto
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 8;
            ctx.strokeText(`${porcentaje}%`, 250, 450);
            ctx.fillText(`${porcentaje}%`, 250, 450);

            // Generamos el attachment con el buffer de NAPI
            const buffer = canvas.toBuffer('image/png');
            const attachment = new AttachmentBuilder(buffer, { name: 'atrocidad.png' });
            
            message.reply({ 
                content: `${target}, ¡Te falta atrocidad!`, 
                files: [attachment] 
            });

        } catch (error) {
            console.error(error);
            message.reply('Hubo un error al cargar la imagen.');
        }
    }
};
