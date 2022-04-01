export function newHashtags(currentHashtags, originalHashtags) {
  const newHashtagsFound = [];
  for (let i = 0; i < currentHashtags.length; i++) {
    const hashtag = currentHashtags[i];
    if (originalHashtags.indexOf(hashtag) === -1) {
      newHashtagsFound.push(hashtag);
    }
  }

  return newHashtagsFound;
}