/*
 * Copyright (c) 2019. Author: FaustinM | MIT License | jc-widget | twitter.com/faustinn_
 */

'use strict';

const fs = require('fs');
const crypto = require('crypto');

const writeCache = {};

function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

async function storeComment(comment) {
  const key = comment.itemId;
  let data = require(`../comments/${key}.json`);
  data.push(comment);

  writeFile(`./comments/${key}.json`, data);
}

async function storeUnread(comment) {
  let data = require("../unread.json");
  data.push(comment);
  writeFile("./unread.json", data);
}

async function writeFile(file, data, key=uuidv4()){
  const err = await fs.writeFileSync(file, JSON.stringify(data));
  if(err) {
    console.warn("Erreur lors de l'écriture de " + file);
    delete require.cache[require.resolve("." + file)];
    return { status : "error", error : "onWriting" }
  } else {
    delete require.cache[require.resolve("." + file)];
    return { status : "ok" }
  }
}

function readComments(key){
  if(!fs.existsSync(`./comments/${key}.json`)) fs.writeFileSync(`./comments/${key}.json`, "[]");
  return require(`../comments/${key}.json`);
}
function readUnreadComments(){
  return require(`../unread.json`);
}

async function deleteComment(comment) {
  let data;
  try {
    data = require(`../comments/${comment.body.itemId}.json`);
  } catch(e) {
    return {status : "error", error: "onRead"}
  }
  data = data.filter(element => !(element.commentId === comment.body.commentId));
  return await writeFile(`./comments/${comment.body.itemId}.json`, data, comment.body.itemId);
}

async function deleteUnread(comment) {
  let data;
  try {
    data = require(`../unread.json`);
  } catch(e) {
    return {status : "error", error: "onRead"}
  }
  data = data.filter(element => !(element.commentId === comment.body.commentId));
  return await writeFile(`./unread.json`, data);
}

function checkJSON(){
  const { validateJSON } = require("./validation.js");
  for(let file of fs.readdirSync("./comments")){
    if(!validateJSON("./comments/" + file)) {
      fs.writeFileSync("./comments/" + file, "[]");
      console.warn("[Verif] Erreur sur le fichier " + file)
    }
  }
  if(!validateJSON("./unread.json")) {
    fs.writeFileSync("./unread.json", "[]");
    console.warn("[Verif] Erreur sur la liste des non-lu")
  }
}

module.exports = {
  storeComment,
  storeUnread,
  readComments,
  deleteComment,
  deleteUnread,
  checkJSON,
  readUnreadComments
};
