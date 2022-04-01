import * as hashtagsRepository from "../repositories/hashtagsRepository.js";

export async function getHashtags(_req, res) {
  try {
    const hashtags = await hashtagsRepository.listHashtags();

    res.send(hashtags.rows);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);    
  }
}