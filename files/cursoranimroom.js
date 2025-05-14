class Room {
    constructor(name, settings, user) {
        this.isLobby = true;
        this.ppl = {};
        this.connections = [];
        this._id = "cursoranimations";
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
              { _id: "Nope", id: "1", name: "Bot", color: "#F12345" },
              { _id: "Nope", id: "2", name: "Bot", color: "#5F1234" },
              { _id: "Nope", id: "3", name: "Bot", color: "#45F123" },
              { _id: "Nope", id: "4", name: "Bot", color: "#345F12" },
              { _id: "Nope", id: "5", name: "Bot", color: "#2345F2" },
              { _id: "Nope", id: "6", name: "Bot", color: "#12345F" },
              { _id: "Nope", id: "7", name: "Bot", color: "#FFFFFF" },
              { _id: "Nope", id: "8", name: "Spectator count: " + this.connections.length, color: "#000000" }
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
        }); // JSON to send to new users, ternary incase the data needs to be used in the room list (ls, +ls, -ls) events
      
        this.get = d => {
            if (this.connections.filter(r => r._id === d).length) return this.connections.filter(r => r._id === d);
            else return false;
        }; // Find user by _id
      
        this.findParticipantById = d => {
            if (this.connections.filter(r => r.id === d).length) return this.connections.filter(r => r.id === d)[0];
            else return false;
        }; // Find user by their id
      
        this.sendArray = J => {
            let arr = [];
            this.connections.forEach(u => arr.push(u.sendArray(J)));
            J.forEach(b => {
                if (b.m === "a") this.chatlog.push(b);
            });
            return arr;
        }; // send an array of messages to the entire room
      
        this.banlist = {}; // banned users
      
        this.ban = (sender, user, ms) => {

        };
      
        this.where = filter => {

        }; // filter to get users, also broadcast function to send to all those users
        
        this.add = user => {
            this.connections.push(user);
            user.id = "8";
            user.sendArray([this.getJSON(user)]);
            this.sendArray([{
              m: "p",
              id: "8",
              name: "Spectator count: " + ++this.connectionscount
            }]);
        }; // Important function, tries to handle alot of complicated stuff adding users.
      
        this.remove = user => {
            if(this.connections.includes(user)) this.connections.splice(this.connections.indexOf(user), 1);
            user.setChannel({ _id: "lobby" });
            this.sendArray([{
              m: "p",
              id: "8",
              name: "Spectator count: " + --this.connectionscount
            }]);
        }; // Important function, tries to handle alot of complicated stuff removing users.
        
        this.refresh = () => {

        }; // Resents the ch event to every client incase a major update in the room data has occured
        
        this.panicAndExplode = () => {

        }; // Sometimes I trigger this using my js command because its fun, looks like a crash to the user
        
        this.giveChown = user => {

        }; // Forcibly gives the crown to a user, verification of the room owner needs to occur somewhere else before calling this function
      
        this.cursors = Object.keys(this.getJSON({}).ppl).map(c => [50, 50]);
      
        this.loop = setInterval(() => {
          this.cursors.forEach((c, i) => {
            c[0] += Math.sin(Date.now() / 3333) * 0.5;
            c[1] += Math.cos(Date.now() / 3333) * 1.5;
            if(!c.speed) c.speed = 0.25;
            if(!c.speed2) c.speed2 = 0.0625;
            c.speed += (Math.random() - 0.5) / 20;
            c.speed2 += (Math.random() - 0.5) / 20;
            c[0] += i * c.speed;
            c[1] += i * c.speed2;
            if(c[0] > 90 || 10 > c[0]) c.speed = -c.speed;
            if(c[1] > 90 || 10 > c[1]) c.speed2 = -c.speed2;
            c[1] = Math.max(10, Math.min(c[1], 90));
            c[0] = Math.max(10, Math.min(c[0], 90));
            this.sendArray([{
              m: "m",
              id: String(i + 1),
              x: c[0],
              y: c[1]
            }]);
          });
        }, 65);
      
        this.genericcounter0 = 0;
      
        this.broadcast_loop = setInterval(() => {
          this.sendArray([{
            ...this.getJSON({ }),
            p: String(((this.genericcounter0 += 1) % 8) + 1)
          }]);
        }, 1000);
    };
};

module.exports = Room;