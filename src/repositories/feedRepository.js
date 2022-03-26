import connection from "../db.js";

async function getAllLikes(postId) {
    const promise = await connection.query(`
        SELECT * 
            FROM likes 
            WHERE "postId" = $1
        `, [postId]);
    return promise;
}

async function insertLike(postId, userId, isLiked) {

    const promise = await connection.query(`
        INSERT INTO likes
            ("userId", "postId", "isLike") VALUES ($1, $2, $3)
    `, [userId, postId, isLiked])

    return promise
}

async function deleteLike(postId, userId, isLiked) {
    
    const promise = await connection.query(`
        DELETE FROM likes 
            WHERE "postId" = $1 AND "userId" = $2
        `, [postId, userId]);

    return promise;
}

const feedRepository = {
    getAllLikes,
    deleteLike,
    insertLike
};

export default feedRepository;

// SELECT posts."userId", l."postId", l."isLike" FROM posts JOIN likes l ON l."postId" = posts.id WHERE posts."userId" = 13