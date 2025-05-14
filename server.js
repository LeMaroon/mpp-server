// process.exit();//YAYYYYYYYYYYY!
// own;

var kapybara;
var WebSockets = require("ws");
var clients = {};

const fs = require("fs");

var adminkeys = require("./files/adminkeys.js");
var Room = require("./files/room.js");
var DummyRoom = require("./files/dummyroom.js");
var Weird = require("./files/dummyr00m.js");
var User = require("./files/user.js");
var config = require("./files/config.js");
var cursoranimations = require("./files/cursoranimroom.js");
var RoomWcoolbot = require("./files/roomwiththecoolbot.js");
 
var rooms = {
  //weird: new (require("./files/dummyr00m.js"))(),
  //dum: new (require("./files/dummyroom.js"))(),
  //cursor: new (require("./files/cursoranimroom.js"))(),
  //Bot: new (require("./files/roomwiththecoolbot.js")),
  //DummyRoom: new DummyRoom()
};

function sendServerTime() {
  Object.values(rooms).forEach((a) => {
    a.sendArray([
      { 
        m: "t",
        t: Date.now(),
      },
    ]); // broadcast time
  });
}

setInterval(sendServerTime, 2000); // send server time every 2000ms

function moveUserToChannel(user, channel, force) {
  let reject = () =>
    user.sendArray([
      {
        class: "short",
        duration: 7000,
        m: "notification",
        target: "#room",
        text: "You can't join that channel, did you get banned?",
        title: "Notice",
      },
    ]); // Banned notice??
  let c = typeof channel === "string" ? rooms[channel] : channel; // Get actual channel
  if (force) return c.add(user); // force join idea was "inspired" by aeiou's mpp clone, but can come in very useful sometimes
  if (c._id === "illegalname") return reject(); // Bad room name lol
  if (c.connections.length < 20) return c.add(user); // lobby isn't full, allow them to join
  return reject(); // no conditions were met that let them in, just say something went wrong I guess
}

var Server = new WebSockets.Server({
  port: 8080}); // Websocket server

var allUsers = []; // All the current users

var serversClosed = false;

Server.on("connection", (cws, req) => {
  let user = new User(req.headers["x-forwarded-for"].split(",")[0], cws);
  user.req = req;
  allUsers.push(user);
  
  const admin = ["12f3990915fc2ec8e2f8687d"];

  cws.on("close", (msg) => {
    if (user.room) user.room.remove(user);
  });

  // --- Load and parse banned list
  const bannedData = fs.readFileSync("./banned.json", "utf8");
  const parsedBan = JSON.parse(bannedData);

  const userId = user.getJSON()._id;
  const banEntry = parsedBan[userId];

  // --- Check if banned and if ban is still active
  if (banEntry) {
    const now = Date.now();
    if (now < banEntry.until) {
      return user.sendArray([
        {
          class: "long",
          duration: 100000,
          m: "notification",
          target: "#piano",
          text: `You are banned from this site. Reason: ${banEntry.reason}`,
          title: "Notice"
        },
      ]);
    } else {
      // Optional: remove expired ban
      delete parsedBan[userId];
      fs.writeFileSync("./banned.json", JSON.stringify(parsedBan, null, 2));
    }
  }

  user.sendArray([
    {
      m: "hi",
      v: 1.0,
      codename: "kotigus",
      u: user.getJSON(),
    },
  ]);

  // Important function, tries to handle alot of complicated stuff adding users.
 
  //return;

  user.setChannel = (msg, force) => {
    let oldroom = user.room;
    if (user.room && user.room.connectionscount) {
      user.room.connectionscount--; //
      user.room.reload();
    }
    let prepared = false;
    if (!rooms[msg._id]) {
      console.log("Creating room");
      console.log({
        Room,
      });
      user.prepareForNewRoom(msg._id);
      prepared = true;
      rooms[msg._id] = new Room(
        msg._id,
        typeof msg.set === "object" ? msg.set : null,
        user
      );
      rooms[msg._id].deletefunc = function () {
        delete rooms[msg._id];
        delete this;
      };
      console.log("Created new room for ", msg._id);
    } else {
      console.log("Room", msg._id, "Already exists!");
    }
    if (oldroom) oldroom.remove(user);
    if (!prepared) user.prepareForNewRoom(msg._id);
    moveUserToChannel(user, rooms[msg._id], force);
  }; // Room stuff ;-;

  user.on("ch", (msg) => {
    if (user.room && user.room._id === msg._id) return;
    if (!msg.hasOwnProperty("_id")) return console.log("NO _ID");
    user.setChannel(msg);
    // console.log("Appending user to", msg._id, "- ip is", user.realIP, "- uid is", user._id);
  });

  user.on("a", (msg) => {
    
//let isAdmin = admin.indexOf(msg.p._id) !== -1;

    let serv = {
      name: "Server",
      _id: "server",
      id: "server",
    }; // Server profile?
    if (msg.message.length > 4096) return console.log("MSG too long");
    if (
      //msg.message.startsWith(config.evalKey) ||
      (msg.message.startsWith("-js") && user.isAdmin)
    ) {
      console.log("Executing js");
      user.room.sendArray([
        {
          m: "a",
          a: msg.message,
          p: { ...user.getJSON() },
          t: Date.now(),
        },
      ]);
      try {
        user.room.sendArray([
          {
            m: "a",
            a: String(
              eval(msg.message.substring(3))
            ),
            p: { ...serv, color: "#00ff00" },
            t: Date.now(),
          },
        ]);
      } catch (e) {
        user.room.sendArray([
          {
             m: "a",
            a: String(e),
            p: { ...serv, color: "#ff0000" },
            t: Date.now(),
          }, 
         ]);
       } 
      return console.log("JS thing done");
    }


    
    if (msg.message.startsWith("-rainbow") && user.isAdmin) {
      var count = 0;
      var size = 100;
      var rainbow = new Array(size);

      for (var i = 0; i < size; i++) {
        var red = sin_to_hex(i, (0 * Math.PI * 2) / 3); // 0   deg
        var blue = sin_to_hex(i, (1 * Math.PI * 2) / 3); // 120 deg
        var green = sin_to_hex(i, (2 * Math.PI * 2) / 3); // 240 deg

        rainbow[i] = "#" + red + green + blue;
      }

      function sin_to_hex(i, phase) {
        var sin = Math.sin((Math.PI / size) * 2 * i + phase);
        var int = Math.floor(sin * 127) + 128;
        var hex = int.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
      }

      kapybara = setInterval(function () {
        if (count > rainbow.length) count = 0;
        count++;
        user.color = rainbow[count];
        user.globalReload();
        user.save();
      }, 50);
      return;
    }

    if (msg.message.startsWith("~admin")) {
      user.room.sendArray([
        {
          m: "a",
          a: `Verified ${user.name} [${user._id}] as an admin.`,
          p: { ...serv, color: "#FFFFFF" },
          t: Date.now(),
        },
      ]);
      user.setAdmin();
      return console.log("Admin key set thing done");
    }

    user.room.sendArray([
      {
        m: "a",
        a: msg.message,
        t: Date.now(),
        p: user.getJSON(),
      },
    ]);
  });

  user.on("userset", (msg) => {
    if (typeof msg.set !== "object" || Array.isArray(msg.set)) return; // Bad message, refuse to continue running the code because it could cause a crash
    if (msg.set.color && msg.set.name && msg.set.name.length <= 80) {
      user.name = msg.set.name; // change their name
      user.color = msg.set.color; // change their color
      user.globalReload(); // resend user data for others in the room so the name update shows up
      user.save();
    }
  });

  user.on("chown", (msg) => {
    if (!user.room.crown || user.room.crown.userId !== user._id) return; // No crown or the user dosen't have it, refuse crown action
    if (!user.room.findParticipantById(msg.id)) return; // Bad id, refuse crown action
    user.room.giveChown(user.room.findParticipantById(msg.id)); // Everything seems good, run crown action
  });

  user.on("chset", (msg) => {
    if (!msg.set) return;
    if (!user.room.crown || user.room.crown.userId !== user._id) return; // No crown or the user dosen't have it, refuse chset action
    if (!user.room.findParticipantById(user.id)) return; // Bad id, refuse chset action
    user.room.settings.chat = msg.set.chat;
    user.room.settings.visible = msg.set.visible;
    user.room.settings.crownsolo = msg.set.crownsolo;
    user.room.settings.color = msg.set.color;
    user.room.refresh();
  });

  user.on("m", (msg) => {
    user.room
      .where(
        (c) =>
          c._id !==
          user._id /* Where filter will prevent the original user(s) on that ip from recieving their own cursor movement */
      )
      .broadcast([
        {
          m: "m", // message type
          x: msg.x || 50, // mouse x or centre if not provided
          y: msg.y || 50, // mouse y or centre if not provided
          id: user.id, // user id
        },
      ]);
  });

  user.on("n", (msg) => {
    if (!msg.t || !msg.n || !Array.isArray(msg.n)) return; // don't broadcast invalid messages ig
    msg.n = msg.n.filter(
      (c) =>
        c &&
        c.n &&
        c.n.length < 6 &&
        (c.v ? (c.v = parseFloat(c.v)) : c.hasOwnProperty("s"))
    ); // dumb note stuff

    user.room
      .where(
        (c) =>
          c.prvlcid !==
          user.prvlcid /* Where filter will prevent the original user hearing the notes again */
      )
      .broadcast([
        {
          m: "n", // message type
          n: msg.n, // note stuff
          t: msg.t, // message timing
          p: user.id, // user id
        },
      ]);
  });

  user.on("kickban", (msg) => {
    if (!user.room) return; // The user isn't in a room so they can't kickban
    let args = [user, user.room.get(msg._id)[0], msg.ms]; // function arguments

    user.room.ban(...args); // use function arguments with spread syntax
    // The user has tried to ban someone
  });

  user.on("+ls", (msg) => {
    user.searchingForRooms = true; // Variable for room list broadcaster to pick up on
    user.sendArray([
      {
        m: "ls",
        u: Object.values(rooms).map((c) => c.getJSON("list")), // every room, put into an array.
      },
    ]);
    // The user has opened the room list, we're going to send them the current rooms array then allow the room list broadcast to send to them
  });

  user.on("-ls", (msg) => {
    user.searchingForRooms = false; // Variable for room list broadcaster to pick up on
    // The user has finished checking the rooms list, we can stop the room list broadcast from sending to them
  });
});
