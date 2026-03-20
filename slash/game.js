class ImposterGame {
    constructor(host, maxPlayers, numImposters, usePistas) {
        this.host = host;
        this.maxPlayers = maxPlayers;
        this.numImposters = numImposters;
        this.usePistas = usePistas;
        this.players = [host];
        this.bannedIds = [];
        this.started = false;
        this.imposterIds = [];
        this.word = "";
    }

    addPlayer(user) {
        if (this.players.length >= this.maxPlayers) return "La sala está llena.";
        if (this.players.some(p => p.id === user.id)) return "Ya estás en la sala.";
        if (this.bannedIds.includes(user.id)) return "Fuiste expulsado de esta partida.";
        this.players.push(user);
        return "ok";
    }
}
module.exports = ImposterGame;
