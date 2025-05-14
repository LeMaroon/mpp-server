var Hash = require("./hash.js"); // for creating hashes for stuff like ids

class Room {
    constructor() {
      
        const gthis = this;
      
        this.isLobby = true;
        this.ppl = {
          "BOT": {
            name: "🤔 bot",
            color: "#abcdef",
            _id: "BOT", id: "BOT"
          }
        };
        this.deletefunc = () => {};
        this.connections = [];
        this._id = "Bot";
      
        this.settings = {
            crownsolo: false,
            chat: true,
            visible: true,
            color: "#475869",
            color2: "#000000"
        }; // room settings
      
        this.crown = null;
      
        this.chatlog = []; // the "c" event, log of previous chat, chat is not cut off yet
        this.getJSON = p => p === "list" ? Object({
            _id: this._id,
            count: this.connections.length,
            settings: {
                ...this.settings,
                lobby: !this.crown
            },
            crown: this.crown
        }) : Object({
            m: "ch",
            ppl: this.connections.map(r => r.getJSON()),
            _id: this._id,
            p: p.id,
            ch: {
                _id: this._id,
                count: this.connections.length,
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
                if (b.m === "a") {
                  this.chatlog.push(b);
                  b.a && chatHandler(b);
                };
            });
            return arr;
        }; // send an array of messages to the entire room
      
        this.banlist = {}; // banned users
      
        this.ban = (sender, user, ms) => {
            if (!this.crown) return console.log("Regular kickban attempted in the bot room");
        };
      
        this.where = filter => {
            let matches = [];
            this.connections.forEach(c => filter(c) ? matches.push(c) : null);
            matches.broadcast = m => matches.forEach(c => c.sendArray(m));
            return matches;
        }; // filter to get users, also broadcast function to send to all those users
        
        this.add = user => {
            if (this.banlist[user._id] > Date.now() || this._id === "Banlist test") {
                user.sendArray([{
                    class: "short",
                    duration: 7000,
                    m: "notification",
                    target: "#room",
                    text: "You can't join that channel, did you get banned?",
                    title: "Notice"
                }]);
                user.setChannel({
                    _id: "test/awkward"
                });
                return;
            };
            let isOwnerOfRoom = this.crown && this.crown.userId === user;

            if(isOwnerOfRoom) {
              clearTimeout(this.crownTimeout);
              this.crownfree = false;
              this.crown.participantId = user.id;
              this.refresh();
            } else this.connections.forEach(b => {
                b.sendArray([{
                    m: "p",
                    ...user.getJSON()
                }]);
            });
          
            this.connections.push(user);
            user.room = this;
            user.sendArray([this.getJSON(user)]);
            this.ppl[user.id] = user.getJSON();
            user.sendArray([{
                m: "c",
                c: this.chatlog
            }]);
        }; // Important function, tries to handle alot of complicated stuff adding users.
      
        this.remove = user => {
            delete this.ppl[user.id];
            if (this.connections.includes(user)) this.connections.splice(this.connections.indexOf(user), 1);

              this.connections.forEach(b => b.sendArray([{
                m: "bye",
                p: user.id
              }]));
        }; // Important function, tries to handle alot of complicated stuff removing users.
        
        this.refresh = () => {
            this.connections.forEach(b => b.sendArray([this.getJSON(b)]))
        }; // Resents the ch event to every client incase a major update in the room data has occured
        
        this.panicAndExplode = () => {
            if (this.crown === undefined)
                for (let i in this.ppl) this.remove(this.ppl[i]);
        }; // Sometimes I trigger this using my js command because its fun, looks like a crash to the user
        
        this.giveChown = user => {
            this.crown.userId = user._id;
            this.crown.participantId = user.id;
            this.refresh();
        }; // Forcibly gives the crown to a user, verification of the room owner needs to occur somewhere else before calling this function
      
        /** Bot stuff starts here **/
      
        const prefix = "!";
      
        function chat(a) {
          gthis.sendArray([{
            m: "a",
            a, t: Date.now(),
            p: {
              name: "Bot",
              color: "#f12345",
              _id: "BOT", id: "BOT"
            }
          }])
        };
      
        function chatHandler(msg) {
          console.log(msg);
          
          let text = msg.a.toString();
          let participant = msg.p;
          let time = msg.t;
          
          let args = text.split(" ");
          let cmd = args.shift().slice(prefix.length);
          let input = args.join(" ");
          
          console.log({ text, args, cmd, input });
          
          if(!text.startsWith(prefix)) return; // not a bot command!
          
          if(cmd === "ping") chat("Pong!");
        };
    };
};

// Room class to create rooms

module.exports = Room;