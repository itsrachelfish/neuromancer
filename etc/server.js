module.exports = {
  // server to connect to
  //server: 'irc.wetfish.net',
  server: '192.168.0.1',
  
  // port to use
  port: 6697,
  
  // ssl?
  //secure: true,
  
  // self signed ssl cert?
  //selfSigned: true,
  
  // the bot's nick, username, and realname
  name: 'Neuromancer',
  userName: 'imaBot',
  realName: 'Source available via http://github.com/edwin-pers/neuromancer',
  
  // should we autorejoin/connect?
  autoRejoin: true,
  autoConnect: true,
  
  // what channels to join upon connecting
  channels: ["#neuromancer"],
  
  // other configs, see the node-irc docs for more information
  messageSplit: 512,
  stripColors: true,
  encoding: "UTF-8"
}
