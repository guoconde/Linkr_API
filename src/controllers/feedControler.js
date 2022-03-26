
import NoContent from "../errors/NoContentError.js";
import * as feedService from "../services/feedService.js"
import feedRepository from "../repositories/feedRepository.js";
import postsRepository from "../repositories/postsRepository.js";
import NotFound from "../errors/NotFoundError.js";

export async function listHashtagPosts(req, res){
    const { hashtag } = req.params;
    const { user } = res.locals;
    try {
        const rows = await feedService.listByHashtag(user.id, hashtag)
        const { rows: names } = await postsRepository.getNameByLikes()

        const posts = rows.map((el, i) => {
            const filteredNames = names.filter(post => post.postId === el.id)

            const likeNames = filteredNames.map(element => element.userName )

            let newArr = {...el, likeNames}

            return newArr

        })

        
        res.send(posts);
    } catch (error) {
        if (error instanceof NoContent) return res.status(error.status).send(error.message);

        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}

export async function listUserPosts(req, res){
    const { id } = req.params;
    const { user } = res.locals;

    try {
        const data = await feedService.listByUser(user.id, id)
        const { posts: rows } = data

        const { rows: names } = await postsRepository.getNameByLikes()

        const posts = rows.map((el, i) => {
            const filteredNames = names.filter(post => post.postId === el.id)

            const likeNames = filteredNames.map(element => element.userName )

            let newArr = {...el, likeNames}

            return newArr

        })

        data.posts = posts
        
        res.send(data);
    } catch (error) {
        if (error instanceof NoContent || error instanceof NotFound) return res.status(error.status).send(error.message);

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

export async function deleteLike(req, res) {
    const { id } = req.params
    const { isLiked, userId } = req.body
    
    try {
        await feedRepository.deleteLike(id, userId, isLiked)
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
        await feedRepository.insertLike(id, userId, isLiked)
        res.sendStatus(200)
    } catch (error) {
        console.log(error);
        res.status(500).send("Unexpected server error")
    }
}
