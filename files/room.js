var Hash = require("./hash.js"); // for creating hashes for stuff like ids

class Room {
    constructor(name, settings, user) {
        this.isLobby = name.startsWith("lobby") || name.startsWith("test/");
        this.ppl = {};
        this.deletefunc = () => {};
        this.connections = [];
        this._id = name;
        this.settings = {
            crownsolo: false,
            chat: true,
            visible: true,
            color: "#801541",
            color2: "#000000"
        }; // room settings
      
        for (let key in settings) this.settings[key] = settings[key];
        this.crown = this.isLobby ? null : {
            userId: user._id,
            participantId: user.id,
            startPos: {
                x: 50,
                y: 50
            },
            endPos: {
                x: 50,
                y: 50
            },
            time: Date.now()
        }; // crown, annoying piece of ****
      
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
                if (b.m === "a") this.chatlog.push(b);
            });
            return arr;
        }; // send an array of messages to the entire room
      
        this.banlist = {}; // banned users
      
        this.ban = (sender, user, ms) => {
            if (!this.crown) return console.log("Kickban attempted in a lobby :/"); // no room crown
            if (this.crown.userId !== sender._id) return console.log("Crown user _id is " + this.crown.userId + " but the sender _id was " + sender._id + ", kickban prevented"); // not the crown user
            let crowned = sender.name;
          
            this.remove(user);
            user.setChannel({
                _id: "test/awkward"
            });

            this.banlist[user._id] = Date.now() + ms;
            user.sendArray([{
                class: "short",
                duration: 7000,
                m: "notification",
                target: "#room",
                text: "You were banned from " + this._id + " for " + Math.floor(ms / 60000) + " minutes.",
                title: "Notice"
            }]);
          
            this.sendArray([{
                m: "a",
                a: "Banned " + user.name + " from the channel for " + Math.floor(ms / 60000) + " minutes.",
                t: Date.now(),
                p: sender.getJSON()
            }]);
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
            let wasCrowned = this.crown && (this.crown.userId === user._id);
            console.log("Removing _id " + user._id + " from " + this._id + ", crown _id was: " + (this.crown ? this.crown.userId : "None"), ", was leader: " + wasCrowned);
            delete this.ppl[user.id];
            if (this.connections.includes(user)) this.connections.splice(this.connections.indexOf(user), 1);
          
            if (wasCrowned) {
              console.log("doing wasCrowned statement");
                this.crown = { endPos: { x: Math.random() * 100, y: Math.random() * 100 }, startPos: { x: Math.random() * 100, y: Math.random() * 100 }, userId: user._id, time: Date.now() };
                this.crownTimeout = setTimeout(() => {
                  this.crown.userId = null;
                  this.crownfree = true;
                }, 10000);
                this.connections.forEach(b => b.sendArray([this.getJSON()]));
            } else {
              this.connections.forEach(b => b.sendArray([{
                m: "bye",
                p: user.id
              }]));
              console.log("not doing wasCrowned statement");
            };
            if(this.connections.length === 0) this.deletefunc();
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
    };
};

// Room class to create rooms

module.exports = Room;