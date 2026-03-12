const { createCanvas, loadImage } = require("@napi-rs/canvas");
const { AttachmentBuilder } = require("discord.js");

module.exports = {
  name: "quote",
  async execute(message, args) {
    // 1. SEGURIDAD: Evita que el bot se responda a sí mismo o a otros bots (adiós spam)
    if (message.author.bot) return;

    let text = args.join(" ");
    let author = message.author;

    // Si no hay texto, intentar obtenerlo de un mensaje respondido
    if (!text && message.reference) {
      try {
        const replied = await message.channel.messages.fetch(message.reference.messageId);
        text = replied.content;
        author = replied.author; 
      } catch (err) {
        return message.reply("No pude encontrar el mensaje original.");
      }
    }

    if (!text) return message.reply("Escribe un texto o responde a un mensaje.");

    // Configuración del Canvas
    const width = 900;
    const height = 450;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Fondo
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);

    try {
        const avatarURL = author.displayAvatarURL({ extension: "png", size: 512 });
        const avatar = await loadImage(avatarURL);
        ctx.drawImage(avatar, 0, 0, 450, 450);
    } catch (e) {
        // Si falla la carga del avatar, dibujamos un círculo gris
        ctx.fillStyle = "#333333";
        ctx.fillRect(0, 0, 450, 450);
    }

    // Degradado
    const fade = ctx.createLinearGradient(300, 0, 450, 0);
    fade.addColorStop(0, "rgba(0,0,0,0)");
    fade.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = fade;
    ctx.fillRect(300, 0, 151, height);

    // Texto de la cita
    ctx.fillStyle = "#ffffff";
    ctx.font = "italic 32px Sans-serif";
    
    const wrapText = (context, text, x, y, maxWidth, lineHeight) => {
      const words = text.split(" ");
      let line = "";
      for (let i = 0; i < words.length; i++) {
        let testLine = line + words[i] + " ";
        let metrics = context.measureText(testLine);
        if (metrics.width > maxWidth && i > 0) {
          context.fillText(line, x, y);
          line = words[i] + " ";
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, y);
    };

    wrapText(ctx, `"${text}"`, 480, 180, 380, 42);

    // Autor
    ctx.font = "bold 24px Sans-serif";
    ctx.fillStyle = "#bbbbbb";
    ctx.fillText(`— ${author.username}`, 480, 350);

    const buffer = await canvas.toBuffer("image/png");
    const attachment = new AttachmentBuilder(buffer, { name: "quote.png" });

    // 2. ENVIAR RESPUESTA SEGURA
    await message.reply({ 
        files: [attachment],
        failIfNotExists: false // Si el usuario borra su mensaje, el bot NO crashea
    }).catch(err => {
        // 3. RESPALDO: Si el reply falla, lo envía al canal normal
        message.channel.send({ files: [attachment] });
    });
  },
};
