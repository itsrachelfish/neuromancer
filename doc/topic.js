module.exports = {
  usage: "topic <action> <args>",
  actions: "log, restore, replace, set, append, prepend, insert, delete",
  log: "<count> - displays a list of <count> previous topics, defaulting to three",
  restore: "<id> - restores topic <id> from the log, defaulting to the last topic",
  set: "<opt: delimiter> <text> - sets the topic, broken into sections by the delimiter, default of '|'",
  append: "<opt: delimiter> <text> - appends sections to the topic",
  prepend: "<opt: delimiter> <text> - prepends sections to the topic",
  insert: "<index> <delimiter> <text> - inserts sections into the topic at <index>",
  note: "all options are 0-indexed"
}
