import { hashtagsPostsRepository } from "../repositories/hashtagsPostsRepository.js";
import { hashtagsRepository } from "../repositories/hashtagsRepository.js";
import postsRepository from "../repositories/postsRepository.js";

export async function createPost(req, res) {
  const { user } = res.locals;
  const { url, description } = req.body;
  const validateHashtags = /^[#][a-zA-Z0-9]{1,}$/i;

  try {
    const hashtags = description.split(" ").filter((str) => validateHashtags.test(str));
    const params = hashtags.map((h, index) => `$${index + 1}`).join(", ");
    
    let result;
    if (params) {
      result = await hashtagsRepository.find(params, hashtags);
    }

    const hashtagsToBeCreated = [...hashtags];
    result?.rows.forEach((h) => {
      const indexToDelete = hashtagsToBeCreated.indexOf(h.name);
      if (indexToDelete !== -1) {
        hashtagsToBeCreated.splice(indexToDelete, 1);
      }
    });

    const hashtagValues = hashtagsToBeCreated.map(hashtag => `('${hashtag}')`).join(`, `);
    
    if (hashtagValues) {
      await hashtagsRepository.insert(hashtagValues);
    }
    
    await postsRepository.insert(user.id, description, url);

    if (params) {
      const { rows: [post] } = await postsRepository.find(user.id);

      const { rows: hashtagIds} = await hashtagsRepository.find(params, hashtags);

      const hashtagRelations = hashtagIds.map(hashtag => `('${hashtag.id}', ${post.id})`).join(`, `);
      
      await hashtagsPostsRepository.insert(hashtagRelations);
    }

    res.sendStatus(201);
  } catch (error) {
    res.sendStatus(500);
    console.log(error);
  }
}
