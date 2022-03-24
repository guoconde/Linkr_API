
import NoContent from "../errors/NoContentError.js";
import * as feedService from "../services/feedService.js"
import urlMetadata from "url-metadata";

export async function listHashtagPosts(req, res){
    const { hashtag } = req.params;

    try {
        const posts = await feedService.listByHashtag(hashtag)

        const newPosts = []

        for (let i = 0; i < posts.length; i++) {

        const post = await urlMetadata(posts[i].url)
        newPosts.push({ ...posts[i], metadataImage: post.image, metadataTitle: post.title, metadataDescription: post.description })

        }
    
        res.send(newPosts);
    } catch (error) {
        if (error instanceof NoContent) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}