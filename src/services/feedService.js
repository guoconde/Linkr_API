import NoContent from "../errors/NoContentError.js";
import NotFound from "../errors/NotFoundError.js";
import postsRepository from "../repositories/postsRepository.js";
import * as userRepository from "../repositories/userRepository.js";

export async function listByHashtag(userId, hashtagName){
    const posts =  await postsRepository.listByHashtag(userId, hashtagName)
    if (!posts || !posts?.length) throw new NoContent();

    return posts;
}

export async function listByUser(userId, userSearchedId){
    const posts =  await postsRepository.listByUser(userId, userSearchedId)
    if (!posts) throw new NoContent();

    const user = await userRepository.find('id', userSearchedId)
    if(!user) throw new NotFound("User doesn't exists")
    
    return {name:user.name, posts};
}

export async function list(userId, hashtagName, userSearchedId){
    const posts =  await postsRepository.list(userId)
    if (!posts) throw new NoContent();

    const user = await userRepository.find('id', userId)
    if(!user) return null
    
    return {name:user.name, posts};
}