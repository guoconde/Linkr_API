export default function toArrayOfIds(arrayObj) {
  const arrayOfIds = arrayObj.map(obj => {
    const [id] = Object.values(obj);
    return id;
  });

  return arrayOfIds;
}