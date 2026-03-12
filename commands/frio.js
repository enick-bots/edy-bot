const { AttachmentBuilder } = require('discord.js');
const { createCanvas, loadImage } = require('@napi-rs/canvas');

module.exports = {
    name: 'frio',
    async execute(message, args) {
        const target = message.mentions.users.first() || message.author;
        const porcentaje = Math.floor(Math.random() * 101);
        
        const canvas = createCanvas(500, 500);
        const ctx = canvas.getContext('2d');

        const avatar = await loadImage(target.displayAvatarURL({ extension: 'png', size: 512 }));
        ctx.drawImage(avatar, 0, 0, 500, 500);

        // Filtro celeste
        ctx.fillStyle = 'rgba(0, 191, 255, 0.3)';
        ctx.fillRect(0, 0, 500, 500);

        // Texto del porcentaje
        ctx.font = 'bold 80px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        
        // Borde al texto para que resalte
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 8;
        ctx.strokeText(`${porcentaje}%`, 250, 450);
        ctx.fillText(`${porcentaje}%`, 250, 450);

        const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'frio.png' });
        
        message.reply({ 
            content: `${target} esta ${porcentaje}% frio, mendigo bodrio`, 
            files: [attachment] 
        });
    }
};
