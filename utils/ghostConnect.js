/*
 * Copyright (c) 2019. Author: FaustinM | MIT License | jc-widget | twitter.com/faustinn_
 */
const fetch = require("node-fetch");
const config = require("../config.json");
async function getPerm(cookie) {
  if(!cookie) return {
    name : "Nobody",
    profile_image : null,
    role : config.role.find(el => el.name === "nothing")
  };
  return parserResp(await userRole(cookie))
}
function parserResp(json) {
  if(!json.users) {
    return {
      name : "nothing",
      profile_image : null,
      role : config.role.find(el => el.name === "nothing")
    }
  }
  const data = json.users[0];
  let result = {
    name : data.name,
    profile_image : data.profile_image,
  };
  let role = config.role.find(el => el.name === data.roles[0].name);
  if(role) result.role = role;
  else result.role = config.role.find(el => el.name === "nothing");
  return result;
}
async function userRole(cookie) {
  const opts = {
    headers: {
      cookie: 'ghost-admin-api-session='+ cookie +';',
      origin: config.adminApi.split("/").slice(0,3).join("/")
    }
  };
  let rep = await fetch(config.adminApi, opts);
  return rep.json();
}
async function verifyPerm(role, perm){
  if(!config.role.find(el => el.name === role)){
    role = (await getPerm(role)).role.name;
  }
  const permissions = config.role.find(el => el.name === role).permission;
  let permission;
  if(permissions) permission = permissions.find(el => el === perm);
  return !!(permission || config.role.find(el => el.name === role).god);
}
module.exports = {
  getPerm,
  verifyPerm
};
