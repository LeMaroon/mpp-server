class Room {
    constructor(name, settings, user) {
        this.isLobby = true;
        this.ppl = {};
        this.connections = [];
        this._id = "A room.";
        this.connectionscount = 0;
        this.settings = {
          visible: false,
          chat: true
        }
      
        this.crown = this.isLobby ? null : {

        }; // crown, annoying piece of ****
      
        this.chatlog = []; // the "c" event, log of previous chat, chat is not cut off yet
        this.getJSON = p => p === "list" ? Object({
            _id: this._id,
            count: 8,
            settings: {
                ...this.settings,
                lobby: !this.crown
            },
            crown: this.crown
        }) : Object({
            m: "ch",
            ppl: [
              { _id: "server", id: "server", name: "Server", color: "#F12345" }
            ],
            _id: this._id,
            p: p.id,
            ch: {
                _id: this._id,
                count: 8,
                settings: {
                    ...this.settings,
                    lobby: !this.crown
                },
                crown: this.crown,
            }
        })
module.exports = Room;