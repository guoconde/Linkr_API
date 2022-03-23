export function findHashtags(description) {
  const validateHashtags = /^[#][a-zA-Z0-9]{1,}$/i;
  const hashtagsSent = description
    .split(" ")
    .filter((str) => validateHashtags.test(str));
  const hashtags = removeDuplicate(hashtagsSent);
  return hashtags;
}

function removeDuplicate(lst) {
  let i = 0;
  while (i < lst.length) {
    if (lst.indexOf(lst[i]) !== i) {
      lst.splice(i, 1);
    } else {
      i++;
    }
  }

  return lst;
}
