import * as geolocationRepository from "../repositories/geolocationRepository.js";

export async function insertGeolocation(req, res) {
  const { userId, postId, latitude, longitude } = req.body;

  try {
    await geolocationRepository.createGeolocation(userId, postId, latitude, longitude);

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}

export async function deleteGeolocation(req, res) {
  const { postId } = req.params;

  try {
    await geolocationRepository.deleteGeolocation(postId);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Unexpected server error");
  }
}