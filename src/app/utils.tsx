export const randomImgUrl = () => {
  const randomSeed = Math.floor(Math.random() * 10000);
  return `https://picsum.photos/seed/${randomSeed}/200/180`;
};
