export function hashtagsToBeDeleted(searchHashtags, searchUsedHashtags) {
  const hashtagsToBeDeletedFound = [];
  for (let i = 0; i < searchHashtags.rows.length; i++) {
    const hashtag = searchHashtags.rows[i];
    if (!searchUsedHashtags.rows.find(h => h.hashtagId === hashtag.id)) {
      hashtagsToBeDeletedFound.push(hashtag);
    }
  }

  return hashtagsToBeDeletedFound;
}