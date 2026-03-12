const db = require('../db.js');

module.exports = {
    name: 'add',
    async execute(message, args) {
    
        const cmdDestino = args[0]?.toLowerCase();
        const texto = args.slice(1).join(' ');

        if (!cmdDestino || !texto) {
            return message.reply('uso: .add <comando> <frase>');
        }

        if (!db.frasesDB.has(cmdDestino)) {
            db.frasesDB.set(cmdDestino, []);
        }

        db.frasesDB.get(cmdDestino).push(texto);
 
        db.saveAll();

        const msg = await message.reply(` frase agregada a ${cmdDestino}`);
        setTimeout(() => { msg.delete().catch(e => {}); message.delete().catch(e => {}); }, 3000);
    }
};
