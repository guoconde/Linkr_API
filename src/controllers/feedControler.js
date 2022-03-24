
import NoContent from "../errors/NoContentError.js";
import * as feedService from "../services/feedService.js"

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