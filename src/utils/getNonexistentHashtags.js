export function getNonexistentHashtags(hashtags, result) {
  const hashtagsToBeCreated = [...hashtags];

  result?.rows.forEach((h) => {
    const indexToDelete = hashtagsToBeCreated.indexOf(h.name);
    if (indexToDelete !== -1) {
      hashtagsToBeCreated.splice(indexToDelete, 1);
    }
  });

  const queryArgs = hashtagsToBeCreated.map(hashtag => `('${hashtag}')`).join(`, `);
  return queryArgs;
}