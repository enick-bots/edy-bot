const db = require('../db.js');

module.exports = {
    name: 'remove',
    aliases: ['del', 'rem'],
    async execute(message, args) {
        

        const cmdDestino = args[0]?.toLowerCase();
        const textoABorrar = args.slice(1).join(' ');

        if (!cmdDestino || !textoABorrar) {
            return message.reply('uso: .remove <comando> <texto exacto de la frase>');
        }

        // Verificar si el comando existe en la DB
        if (!db.frasesDB.has(cmdDestino)) {
            return message.reply(`el comando ${cmdDestino} no tiene frases guardadas.`);
        }

        const lista = db.frasesDB.get(cmdDestino);
        const index = lista.indexOf(textoABorrar);

        if (index === -1) {
            return message.reply('no encontre esa frase exacta. asegúrate de escribirla igual.');
        }

        lista.splice(index, 1);
        db.saveAll();

        const msg = await message.reply(` frase eliminada de ${cmdDestino}.`);
        setTimeout(() => {
            msg.delete().catch(e => {});
            message.delete().catch(e => {});
        }, 3000);
    }
};
