'use strict';

const express = require('express');
const morgan = require('morgan');
const uuid = require('uuid');
const cors = require('cors');
const url = require('url');
const cookieParser = require('cookie-parser');

const { validateComment } = require('./utils/validation');
const ghostSDK = require('./utils/ghostConnect');
const { renderMarkdown } = require('./utils/markdown');
const { checkJSON, deleteUnread, storeUnread, storeComment, readComments, deleteComment, readUnreadComments } = require('./utils/storage');
const config = require('./config.json');

const app = express();
const port = config.port;

let NUMBER = 0;

app.use(cookieParser());
app.use(express.json());
if(config.dev) app.use(morgan('dev'));
if(config.dev) app.use(cors());

function getComments(req) {
  const pageId = req.query.pageId;
  const comments = readComments(pageId);
  return {
    comments : comments.map(mapComment),
  };
}

function getUserData(req) {
  const data = req.headers.authorization.split('===')[1];
  return JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
}

async function createComment(req) {
  NUMBER++;
  const comment = req.body;

  const { userId, username, userPic, userUrl, userEmail } = getUserData(req);

  const valid = validateComment(comment);

  if(!valid) {
    throw new Error(
      `Request validation failed: ${JSON.stringify(comment)} ${JSON.stringify(
        validateComment.errors,
      )}`,
    );
  }

  comment.userId = userId;
  comment.username = username;
  comment.userPic = userPic;
  comment.userUrl = userUrl;
  comment.userEmail = userEmail;
  comment.commentId = comment.commentId || uuid.v4();
  comment.createdAt = new Date().toISOString();
  comment.commentUrl = getCommentUrl(comment);

  storeUnread(comment);
  storeComment(comment);

  return mapComment(comment);
}

function getCommentUrl(comment) {
  const commentItemId = comment.originalItemId;
  const parsedCommentUrl = url.parse(
    comment.itemProtocol + '//' + commentItemId + '#jc' + comment.commentId,
  );
  parsedCommentUrl.port = comment.itemPort;
  delete parsedCommentUrl.href;
  delete parsedCommentUrl.host;
  return url.format(parsedCommentUrl);
}

function mapComment(data) {
  return {
    itemId : data.itemId,
    commentUrl : data.commentUrl,
    commentId : data.commentId,
    replyTo : data.replyTo,
    parentId : data.parentId,
    userId : data.userId,
    username : data.username,
    userPic : data.userPic,
    userUrl : data.userUrl,
    message : data.message,
    htmlMessage : renderMarkdown(data.message),
    htmlContent : renderMarkdown(data.message),
    createdAt : data.createdAt,
    hidden : false,
    /*number : NUMBER*/
  };
}

app.get('/v2/comments', (req, res, next) => {
  res.json(getComments(req));
});

app.post('/comments/create', (req, res) => {
  createComment(req).then((response) => res.json(response));
});
app.post('/comments/remove', async(req, res) => {
  if(await ghostSDK.verifyPerm(req.cookies['ghost-admin-api-session'], 'remove')) {
    let result = (await deleteComment(req));
    if(result.status === 'error') res.status(500).json(await deleteComment(req));
    else if(result.status === 'ok') res.status(200).json(await deleteComment(req));
  } else res.status(403).json({ status : 'error', error : 'notPermission' });
});
app.get('/comments/list', async (req, res) => {
  if(await ghostSDK.verifyPerm(req.cookies['ghost-admin-api-session'], 'unread')){
    let result = readUnreadComments();
    res.json(result);
  }
});
app.post('/comments/read', async (req, res) => {
  if(await ghostSDK.verifyPerm(req.cookies['ghost-admin-api-session'], 'unread')) {
    let result = (await deleteUnread(req));
    if(result.status === 'error') res.status(500).json(await deleteUnread(req));
    else if(result.status === 'ok') res.status(200).json(await deleteUnread(req));
  } else res.status(403).json({ status : 'error', error : 'notPermission' });
});

if(config.dev) app.get('/login', async(req, res, next) => {
  if(req.cookies['ghost-admin-api-session']) {
    res.send(JSON.stringify(await ghostSDK.getPerm(req.cookies['ghost-admin-api-session'])));
  } else res.send('Stay in pleb');
});

app.get('/webapp.js', async (req, res)=> {
  if((await ghostSDK.getPerm(req.cookies['ghost-admin-api-session'])).role.name !== "nothing") {
    res.sendFile(__dirname + "/utils/webapp.js");
  } else res.send('Stay in pleb');
});
app.get('/panel', async(req, res)=>{
  if((await ghostSDK.getPerm(req.cookies['ghost-admin-api-session'])).role.name !== "nothing") {
    res.sendFile(__dirname + '/panel.html')
  } else res.send('Forbidden');
});
app.get('/panel/:id', async(req, res)=>{
  const fileExist = !(require('fs')).existsSync(`./comments/${req.params.id}.json`);
  if(!req.params.id || fileExist) res.redirect("/panel");
  if((await ghostSDK.getPerm(req.cookies['ghost-admin-api-session'])).role.name !== "nothing") {
    res.sendFile(__dirname + '/panel.html')
  } else res.send('Forbidden');
});

// Verif JSON
checkJSON();


app.listen(port, () => console.log(`JustComments listening on port ${port}!`));
