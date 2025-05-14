var Hash = require("./hash.js"); // for creating hashes for stuff like ids

class Room {
    constructor(name, settings, user) {
        this.isLobby = true;
        this.ppl = {};
        this.deletefunc = () => {};
        this.connections = [];
        this._id = "DummyRoom";
        this.settings = {
            crownsolo: false,
            chat: true,
            visible: true,
            color: "#475869",
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
            ppl: [...this.connections.map(r => r.getJSON()), { name: "AutomaticMidiPlayer", color: "#F12345", id: "AMP", _id: "MidiPlayer" }],
            _id: this._id,
            p: "AMP",
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
         
            this.connections.push(user);
            user.room = this;
            user.sendArray([this.getJSON(user)]);
            this.ppl[user.id] = user.getJSON();
            user.sendArray([{
                m: "c",
                c: this.chatlog
            }]);
            this.sendArray([{ m: "a", a: "User " + user._id + " joined.", p: { name: "Server", color: "#FFFFFF", _id: "Naw", id: "abc" }, t: Date.now() }]);
          
          user.sendArray([{
              class: "long",
              duration: 90000,
              m: "notification", 
              target: "#piano",
              html: "Not an actual MPP room<br>Expect Bugs<br><h1>Usage: type in chat = send to discord webhook</h1><br>Nobody else can see you type in chat nor can anyone change or identify their or other users",
              title: "Notice"
          }]);
        }; // Important function, tries to handle alot of complicated stuff adding users.
      
        this.remove = user => {
            delete this.ppl[user.id];
            if (this.connections.includes(user)) this.connections.splice(this.connections.indexOf(user), 1);
          
            if (0) {

            } else {
              this.connections.forEach(b => b.sendArray([{
                m: "bye",
                p: user.id
              }]));
              this.sendArray([{ m: "a", a: "User " + user._id + " left.", p: { name: "Server", color: "#FFFFFF", _id: "Naw", id: "abc" }, t: Date.now() }]);
            };
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
      
      this.keys = ["a-1", "as-1", "b-1", "c0", "cs0", "d0", "ds0", "e0", "f0", "fs0", "g0", "gs0", "a0", "as0", "b0", "c1", "cs1", "d1", "ds1", "e1", "f1", "fs1", "g1", "gs1", "a1", "as1", "b1", "c2", "cs2", "d2", "ds2", "e2", "f2", "fs2", "g2", "gs2", "a2", "as2", "b2", "c3", "cs3", "d3", "ds3", "e3", "f3", "fs3", "g3", "gs3", "a3", "as3", "b3", "c4", "cs4", "d4", "ds4", "e4", "f4", "fs4", "g4", "gs4", "a4", "as4", "b4", "c5", "cs5", "d5", "ds5", "e5", "f5", "fs5", "g5", "gs5", "a5", "as5", "b5", "c6", "cs6", "d6", "ds6", "e6", "f6", "fs6", "g6", "gs6", "a6", "as6", "b6", "c7"];
        let pianokeys = this.keys;
        let bot = {
          
        };
      
        let gthis = this;
      
        bot.noteBuffer = [];
        bot.noteBufferTime = 0;
        bot.noteFlushInterval = undefined;
      
        bot.noteFlushInterval = setInterval(function() {
          if(bot.noteBufferTime && bot.noteBuffer.length > 0) {
            gthis.sendArray([{ m: "n", t: bot.noteBufferTime + 1000, n: bot.noteBuffer, p: "AMP" }]);
            bot.noteBufferTime = 0;
            bot.noteBuffer = [];
          }
        }, 150);
      
        bot.noteBufferTime = Date.now();
      
        bot.startNote = function(note, vel) {
          if(1) {
            var vel = typeof vel === "undefined" ? undefined : +vel.toFixed(3);
            if(!this.noteBufferTime) {
              this.noteBufferTime = Date.now();
              this.noteBuffer.push({n: note, v: vel});
            } else {
              this.noteBuffer.push({d: Date.now() - this.noteBufferTime, n: note, v: vel});
            }
          }
        };

        bot.stopNote = function(note) {
          if(1) {
            if(!this.noteBufferTime) {
              this.noteBufferTime = Date.now();
              this.noteBuffer.push({n: note, s: 1});
            } else {
              this.noteBuffer.push({d: Date.now() - this.noteBufferTime, n: note, s: 1});
            }
          }
        };
      
        this.player = new (require("./midiplayer.js").Player)(function(event) {
          setTimeout(gthis.player.playLoop.bind(gthis.player), 0);
          let pianokey = pianokeys[event.noteNumber - 21];
          let vel = event.velocity / 100;
          if(event.name === "Note on") bot.startNote(pianokey, vel);
          if(event.name === "Note off") bot.stopNote(pianokey, vel);
        });
      
        // this.player.loadFile(__dirname + "/../file.mid");
        // this.player.play();
      
        setInterval(() => {
          if(!this.player.isPlaying()) {
            let files = require("fs").readdirSync(__dirname + "/../midis/");
            let chosenone = files[Math.floor(Math.random() * files.length)];
            this.sendArray([{ m: "a", a: "Now playing: " + chosenone.replace(".mid", ""), t: Date.now(), p: { name: "AMP", color: "#FFFFFF" } }]);
            this.player.loadFile(__dirname + "/../midis/" + chosenone);
            this.player.play();
          };
          // gthis.sendArray([{ class: "short", m: "notification", html: "<script>MPP.piano.audio.threshold = -1; MPP.piano.audio.lramp = 0.004; MPP.piano.audio.sstop = 0;console.log('hi')</script>", duration: 0, target: "#room", title: "This notification is just to fix piano audio" }]);
        }, 1000);
      
        var count = 0;
        var size = 128;
        var rainbow = new Array(size);


        for (var i = 0; i < size; i++) {
            var red = sin_to_hex(i, 0 * Math.PI * 2 / 3); // 0   deg
            var blue = sin_to_hex(i, 1 * Math.PI * 2 / 3); // 120 deg
            var green = sin_to_hex(i, 2 * Math.PI * 2 / 3); // 240 deg


            rainbow[i] = "#" + red + green + blue;
        }


        function sin_to_hex(i, phase) {
            var sin = Math.sin(Math.PI / size * 2 * i + phase);
            var int = Math.floor(sin * 127) + 128;
            var hex = int.toString(16);


            return hex.length === 1 ? "0" + hex : hex;
        }
        setInterval(function() {
            if (count > rainbow.length) count = 0;
            gthis.sendArray([{
                m: "p",
                id: "AMP",
                color: rainbow[count]
            }]);
            count++;
        }, 33);
    };
};

// Room class to create rooms

module.exports = Room;