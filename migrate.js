
/*
 * Copyright (c) 2019. Author: FaustinM | MIT License | jc-server | twitter.com/faustinn_
 */

// For migrate from old file system to new

const FOLDER = './comments/';
const fs = require('fs');
let writeCache = {};

async function readFile(PATH, callback){
  fs.readFile(`./comments/${PATH}`, 'utf8', (err, origin) => {
    if (err) {
      console.error(err);
    } else callback(PATH, origin
      .split('\n')
      .filter((line) => line !== '')
      .map((line) => JSON.parse(line)))
  });
}

async function writeFile(PATH, content){
  const NAME = content[0].itemId;
  writeCache[NAME] = fs.createWriteStream(`./comments/${NAME}.json`);
  writeCache[NAME].on('open', () => {
    writeCache[NAME].write(`${JSON.stringify(content)}`, 'utf8', (err) => {
      if(err) console.warn("Erreur lors de l'écriture de " +NAME);
      else writeCache[NAME].close();
    })
  });
}

fs.readdirSync(FOLDER).forEach(file => {
  if(file.includes(".jsonl")) readFile(file, writeFile)
});
