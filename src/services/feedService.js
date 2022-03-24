import NoContent from "../errors/NoContentError.js";
import postsRepository from "../repositories/postsRepository.js";
import * as userRepository from "../repositories/userRepository.js";

export async function listByHashtag(hashtag){
    const posts =  await postsRepository.listByHashtag(hashtag)
    if (!posts || !posts?.length) throw new NoContent();
    
    return posts;
}

export async function listByUser(userId){
    const posts =  await postsRepository.listByUser(userId)
    if (!posts) throw new NoContent();

    const { name } = await userRepository.find('id', userId)
    
    return {name, posts};
}