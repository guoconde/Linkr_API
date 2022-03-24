import postsRepository from "../repositories/postsRepository.js";
import urlMetadata from "url-metadata";
import { createHashtags, createRelation } from "../services/hashtagsService.js";

export async function createPost(req, res) {
  const { user } = res.locals;
  const { url, description } = req.body;
  
  try {
    const { hashtagsQuery, hashtagsInPost } = await createHashtags(description);
      
    await postsRepository.insert(user.id, description, url);

    if (hashtagsInPost.length > 0) {
      createRelation(user.id, hashtagsQuery, hashtagsInPost);
    }

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
}
export async function allPosts(req, res) {

  try {
    const { rows: posts } = await postsRepository.posts()

    const newPosts = []

    for (let i = 0; i < posts.length; i++) {

      const post = await urlMetadata(posts[i].url)
      newPosts.push({ ...posts[i], metadataImage: post.image, metadataTitle: post.title, metadataDescription: post.description })

    }

    res.send(newPosts)

  } catch (error) {
    res.sendStatus(500);
    console.log(error)
  }
}
