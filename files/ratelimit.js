function limit (name, times, cooldown) {
  this.name = name;
  this.times = 0;
  this.cooldown = 0;
  this.currentusers = {};
  this.use = user => {
    this.currentusers[user] = { times: this.currentusers[user].times || 1, cooldown: false, expire: Date.now() }
  }
}

// I never finished this, no rate limits yet!