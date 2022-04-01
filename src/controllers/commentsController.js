import * as commentsRepository from "../repositories/commentsRepository.js";

export async function createComment(req, res) {
  const { userId, postId, comment } = req.body;

  try {
    await commentsRepository.insertComment(userId, postId, comment);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function listComments(req, res) {
  const { postId } = req.params;
  const { id } = res.locals.user;
  if (!postId) {
    res.status(404).send("Post not found!");
  }

  try {
    const comments = await commentsRepository.listComments(id, postId);
    
    res.send(comments.rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}