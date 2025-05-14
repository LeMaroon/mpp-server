var Hash = require("./hash.js");
var { salt, default_name } = require("./config.js");

var fs = require("fs"); // file read/write
var crypto = require("crypto");
function ipfriendlyname(ip) {
  return Hash(
    "IPwowcoolip" + salt + process.env.SALT + ip.replace(/\./g, "_")
  ).slice(0, 30);
}

var loadUsers = true;

class User {
  constructor(ip, cws, profile = {}) {
    // Load profile from disk if it exists
    if (loadUsers) {
      try {
        this.profileFromFS = fs.readFileSync(
          __dirname + "/../users/" + ipfriendlyname(ip) + ".json"
        );
      } catch (e) {}
      if (this.profileFromFS)
        try {
          console.log("Got profile: " + this.profileFromFS);
          profile = JSON.parse(this.profileFromFS);
        } catch (e) {}
    }

    this.ws = cws;
    this.searchingForRooms = false;
    this.firstID = true;
    this.realIP = ip;
    this.fullHash = Hash(ip + salt);
    this.isAdmin = profile.isAdmin || false;

    this.setAdmin = () => {
      this.isAdmin = true;
      this.save();
    };

    this._id = profile._id || this.fullHash.slice(0, 24);
    this.color = profile.color || "#" + this.fullHash.slice(24, 30);
    this.name = profile.name || default_name || "Anonymous";
    this.id = Hash(this._id).slice(0, 24);
    this.tag = profile.tag;
    this.token = profile.token || crypto.randomBytes(32).toString("hex");
    this.prvlcid = (Math.random() * 3800).toString(16);
    this.room = null;

    this.getJSON = () =>
      Object({
        name: this.name,
        color: this.color,
        _id: this._id,
        id: this.id,
        tag: this.tag,
        token: this.token
      });

    this.sendArray = (data) => {
      if (this.ws.readyState === 1) {
        try {
          this.ws.send(JSON.stringify(data));
          return { status: "Success" };
        } catch (error) {
          return { status: "Error", message: error };
        }
      } else {
        return { status: "Closed" };
      }
    };

    this._events = {};
    this.on = (event, callback) => {
      if (!this._events[event]) this._events[event] = [];
      this._events[event].push(callback);
    };

    this.prepareForNewRoom = (roomuid) => {
      this.id = Hash(roomuid + this._id).slice(0, 24);
    };

    this.globalReload = () => {
      this.room.connections.forEach((c) =>
        c.sendArray([
          {
            m: "p",
            ...this.getJSON(),
          },
        ])
      );
    };

    this.save = () => {
      try {
        fs.writeFileSync(
          __dirname + "/../users/" + ipfriendlyname(ip) + ".json",
          JSON.stringify({
            name: this.name,
            color: this.color,
            _id: this._id,
            isAdmin: this.isAdmin,
            tag: this.tag,
            token: this.token
          })
        );
        console.log(
          "Saved profile: " +
          ipfriendlyname(ip) +
          ".json"
        );
      } catch (e) {
        console.log("Couldn't save profile", e);
      }
    };

    // ✅ Automatically save profile on join
    this.save();

    cws.on("message", (msg) => {
      try {
        let evts = JSON.parse(msg);
        for (let i in evts) {
          let c = evts[i];
          if (this._events[c.m]) {
            try {
              this._events[c.m].forEach((b) => {
                try {
                  b(c);
                } catch (e) {}
              });
            } catch (e) {}
          }
          if (c.m === "bye") {
            cws.close();
            break;
          }
        }
      } catch (e) {}
    });
  }
}

module.exports = User;
