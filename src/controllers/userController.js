import * as userSevice from "../services/userService.js"
import BadRequest from "../errors/badRequest.js";
import Conflict from "../errors/Conflict.js";

export async function register(req, res) {
  const data = req.body;

  try {
    await userSevice.register(data);

    res.sendStatus(201);
  } catch (error) {
    if(error instanceof Conflict) res.status(error.status).send(error.message);

    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function findUsers(req, res) {
  const { find } = req.query;
  const { user } = res.locals;

  try {
    const users = await userSevice.findUsers(find, user);
    
    res.send(users);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function newFollow(req, res) {
  const { followedId } = req.body;
  const { user } = res.locals;
  
  try {
    await userSevice.newFollow(followedId, user);

    return res.sendStatus(200);   
  } catch (error) {
    if(error instanceof BadRequest) res.status(error.status).send(error.message);

    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}