import NoContent from "../errors/NoContentError.js";
import postsRepository from "../repositories/postsRepository.js";

export async function listByHashtag(hashtag){
    const posts =  await postsRepository.listByHashtag(hashtag)
    if (!posts || !posts?.length) throw new NoContent();
    
    return posts;
}