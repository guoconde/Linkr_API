export function deletedHashtags(newHashtagsFound, originalHashtags, currentHashtags) {
  const deletedHashtagsFound = [];
  if (!newHashtagsFound.length && originalHashtags.length > currentHashtags.length) {
    for (let i = 0; i < originalHashtags.length; i++) {
      const hashtag = originalHashtags[i];
      if (currentHashtags.indexOf(hashtag) === -1) {
        deletedHashtagsFound.push(hashtag);
      }
    }
  }

  return deletedHashtagsFound;
}