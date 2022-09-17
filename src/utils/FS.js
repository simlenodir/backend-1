const fs = require("fs");
const path = require("path");

const read = (dir) => {
  return JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "model", dir), {
      encoding: "utf-8",
    })
  );
};

const write = (dir, data) => {
  fs.writeFileSync(
    path.join(__dirname, "..", "model", dir),
    JSON.stringify(data, null, 4)
  );
  return "OK";
};

module.exports = {
  read,
  write,
};
