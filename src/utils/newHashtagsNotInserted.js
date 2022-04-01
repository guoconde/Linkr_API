export function newHashtagsNotInserted(newHashtagsFound, seachedHastags) {
  const newHashtagsNotInsertedFound = [];
  for (let i = 0; i < newHashtagsFound.length; i++) {
    const hashtag = newHashtagsFound[i];
    if (!seachedHastags.rows.find(h => h.name === hashtag)) {
      newHashtagsNotInsertedFound.push(hashtag);
    }
  }

  return newHashtagsNotInsertedFound;
}