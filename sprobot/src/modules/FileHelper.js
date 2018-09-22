const fs = require("fs");

exports.readRunsFile = () => fs.readFileSync("runs.txt").toString().split("\n");