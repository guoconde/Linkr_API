
import NoContent from "../errors/NoContentError.js";
import * as feedService from "../services/feedService.js"
import feedRepository from "../repositories/feedRepository.js";

export async function listHashtagPosts(req, res){
    const { hashtag } = req.params;

    try {
        const posts = await feedService.listByHashtag(hashtag)
    
        res.send(posts);
    } catch (error) {
        if (error instanceof NoContent) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function listUserPosts(req, res){
    const { id } = req.params;

    try {
        const data = await feedService.listByUser(id)
        
        res.send(data);
    } catch (error) {
        if (error instanceof NoContent) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function getLikes(req, res) {

    const { id } = req.params

    try {
        const data = await feedRepository.getAllLikes(id)

        res.send(data)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function changeLike(req, res) {
    const { id } = req.params
    const { isLiked } = req.body
    
    try {
        console.log('aqui')
        await feedRepository.updateLike(isLiked, id)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function newLike(req, res) {
    const { id } = req.params
    const { isLiked, userId } = req.body

    try {
        console.log('aqui')
        await feedRepository.insertLike(id, userId, isLiked)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}
