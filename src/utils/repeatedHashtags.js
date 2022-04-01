export function repeatedHashtags(currentHashtags) {
  for (let i = 0; i < currentHashtags.length; i++) {
    let newHashtagRep = currentHashtags[i];
    if (currentHashtags.indexOf(newHashtagRep) !== -1 &&
      currentHashtags.indexOf(newHashtagRep) !== i) {
      return true;
    }
  }

  return false;
}