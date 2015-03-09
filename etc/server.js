module.exports = {
  // server to connect to
  server: 'irc.primesli.me',
  //server: '192.168.0.1',
  
  // port to use
  //port: 6697,
  port: 6667,
  
  // ssl?
  //secure: true,
  
  // self signed ssl cert?
  //selfSigned: false,
  
  // the bot's nick, username, and realname
  name: 'Neuromancer',
  userName: 'imaBot',
  realName: 'Source available via http://github.com/edwin-pers/neuromancer',
  
  // should we autorejoin/connect?
  autoRejoin: true,
  autoConnect: true,
  
  // what channels to join upon connecting
  channels: ["#primeslime"],
  
  // other configs, see the node-irc docs for more information
  messageSplit: 512,
  stripColors: false,
  encoding: "UTF-8",
  floodProtection: false,
};
