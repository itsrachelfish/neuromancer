module.exports = {
  usage: "remind <-f> <-r> <-s phone number> <-l> <-d>",
  f: "egg-timer style reminder, if not supplied then will wait until the bot sees you again to send the reminder",
  //r: "make the reminder recurr at the same time every 24 hours",
  //s: "optional 9-digit phone number to send the reminder via sms. Acts similar to force in that it'll send the reminder at the time instead of waiting for you",
  r: "not implemented yet",
  s: "not implemented yet",
  l: "displays a list of pending reminders",
  d: "deletes a reminder from the list"
}