class Room {
    constructor(name, settings, user) {
        this.isLobby = true;
        this.ppl = {};
        this.connections = [];
        this._id = "midi";
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
              { _id: "BOT", id: "epicbot", name: "Am I good at playing songs?", color: "#F12345" }
            ],
            _id: this._id,
            p: p.id,
            ch: {
                _id: this._id,
                count: 1,
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
            user.room = this;
            user.sendArray([this.getJSON(user)]);
        }; // Important function, tries to handle alot of complicated stuff adding users.
      
        this.remove = user => {
            let wasCrowned = this.crown && (this.crown.userId === user._id);
            console.log("Removing _id " + user._id + " from " + this._id + ", crown _id was: " + (this.crown ? this.crown.userId : "None"), ", was leader: " + wasCrowned);
            delete this.ppl[user.id];
            if (this.connections.includes(user)) this.connections.splice(this.connections.indexOf(user), 1);
        }; // Important function, tries to handle alot of complicated stuff removing users.
        
        this.refresh = () => {

        }; // Resents the ch event to every client incase a major update in the room data has occured
        
        this.panicAndExplode = () => {

        }; // Sometimes I trigger this using my js command because its fun, looks like a crash to the user
        
        this.giveChown = user => {

        }; // Forcibly gives the crown to a user, verification of the room owner needs to occur somewhere else before calling this function
      
        
        this.keys = ["a-1", "as-1", "b-1", "c0", "cs0", "d0", "ds0", "e0", "f0", "fs0", "g0", "gs0", "a0", "as0", "b0", "c1", "cs1", "d1", "ds1", "e1", "f1", "fs1", "g1", "gs1", "a1", "as1", "b1", "c2", "cs2", "d2", "ds2", "e2", "f2", "fs2", "g2", "gs2", "a2", "as2", "b2", "c3", "cs3", "d3", "ds3", "e3", "f3", "fs3", "g3", "gs3", "a3", "as3", "b3", "c4", "cs4", "d4", "ds4", "e4", "f4", "fs4", "g4", "gs4", "a4", "as4", "b4", "c5", "cs5", "d5", "ds5", "e5", "f5", "fs5", "g5", "gs5", "a5", "as5", "b5", "c6", "cs6", "d6", "ds6", "e6", "f6", "fs6", "g6", "gs6", "a6", "as6", "b6", "c7"];
        
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
        };
      
        let pianokeys = this.keys;
        let bot = {
          
        };
      
        let gthis = this;
      
        bot.noteBuffer = [];
        bot.noteBufferTime = 0;
        bot.noteFlushInterval = undefined;
      
        bot.noteFlushInterval = setInterval(function() {
          if(bot.noteBufferTime && bot.noteBuffer.length > 0) {
            gthis.sendArray([{ m: "n", t: bot.noteBufferTime + 200, n: bot.noteBuffer, p: "epicbot" }]);
            bot.noteBufferTime = 0;
            bot.noteBuffer = [];
          }
        }, 150);
      
        bot.noteBufferTime = Date.now();
      
        bot.startNote = function(note, vel) {
          gthis.sendArray([{ m: "p", id: "epicbot", color: rainbow[count++ % 128] }])
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
      
        this.player = new (require("midi-player-js").Player)(function(event) {
          setTimeout(gthis.player.playLoop.bind(gthis.player), 0);
          let pianokey = pianokeys[event.noteNumber - 21];
          let vel = event.velocity / 100;
          if(event.name === "Note on") bot.startNote(pianokey, vel);
          if(event.name === "Note off") bot.stopNote(pianokey, vel);
        });
      
        // this.player.loadFile(__dirname + "/../file.mid");
        // this.player.play();
      
        setInterval(() => {
          return;
          if(!this.player.isPlaying()) {
            let files = require("fs").readdirSync(__dirname + "/../midis/");
            let chosenone = files[Math.floor(Math.random() * files.length)];
            gthis.sendArray([{ m: "a", a: "Now playing: " + chosenone.replace(".mid", ""), t: Date.now(), p: { name: "Midi Player", color: "#F12345" } }]);
            this.player.loadFile(__dirname + "/../midis/" + chosenone);
            this.player.play();
          };
          gthis.sendArray([{ class: "short", m: "notification", html: "<script>MPP.piano.audio.threshold = -1; MPP.piano.audio.lramp = 0.004; MPP.piano.audio.sstop = 0;console.log('hi')</script>", duration: 0, target: "#room", title: "This notification is just to fix piano audio" }]);
        }, 1000);
    };
};

module.exports = Room;