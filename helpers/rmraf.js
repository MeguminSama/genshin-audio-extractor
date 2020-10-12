const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readdir = promisify(fs.readdir);
const rmdir = promisify(fs.rmdir);
const unlink = promisify(fs.unlink);

exports.rmraf = rmraf = async (dir) => {
  let entries = await readdir(dir, { withFileTypes: true });

  await Promise.all(entries.map(entry => {
    let fullPath = path.join(dir, entry.name);
    return entry.isDirectory() ? rmraf(fullPath) : unlink(fullPath);
  }));

  await rmdir(dir);
};
