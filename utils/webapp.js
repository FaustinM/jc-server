/*
 * Copyright (c) 2020. Author: FaustinM | MIT License | jc-widget | twitter.com/faustinn_
 */

async function getUnread() {
  const pageId = location.pathname.split("/")[2];
  if(pageId) return (await (await fetch(`/v2/comments?pageId=${pageId}`)).json()).comments;
  return await (await fetch('/comments/list')).json();
}

async function addRow({ key, pseudo, email, text, url, id, page }) {
  const template = document.querySelector('template');

  // On clone la ligne et on l'insère dans le tableau
  const tbody = document.querySelector('tbody');
  const clone = document.importNode(template.content, true);
  const td = clone.querySelectorAll('td');
  clone.querySelector('th').textContent = key;
  td[0].textContent = pseudo;
  td[1].textContent = email;
  td[2].textContent = text;

  td[3].children[1].addEventListener('click', () => window.open(url, '_blank'));
  td[3].children[0].addEventListener('click', async (e) => {
    await deleteUnread(id);
    if(await deleteComment(page, id) !== 200) e.target.parentElement.parentElement.remove();
  });
  td[3].children[2].addEventListener('click', async (e) => {
    if(await deleteUnread(page, id) !== 200) e.target.parentElement.parentElement.remove();
  });

  tbody.appendChild(clone);
}

async function deleteComment(page, id) {
  const res = await fetch('/comments/remove', {
    method : 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({itemId:page, commentId: id}),
  });
  return res.statusCode;
}

async function deleteUnread(id) {
  const res = await fetch('/comments/read', {
    method : 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body : JSON.stringify({commentId: id}),
  });
  return res.statusCode;
}

function cleanTable(){
  const el = document.querySelector("tbody");
  while(el.firstChild) {
    el.removeChild(el.firstChild);
  }

}

async function refreshComments() {
  cleanTable();
  const data = await getUnread();

  let key = 0;
  for(let comment of data){
    key++;
    addRow({
      key,
      pseudo : comment.username,
      text: comment.message,
      email : comment.userEmail,
      url : comment.commentUrl,
      id : comment.commentId,
      page : comment.itemId
    })
  }
}
refreshComments();
