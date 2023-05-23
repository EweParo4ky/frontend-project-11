const getFeed = (parsedData) => {
  const feedTitle = parsedData.querySelector('title').textContent;
  const feedDescription = parsedData.querySelector('description').textContent;
  return { feedTitle, feedDescription };
};

const getPosts = (parsedData) => {
  const items = parsedData.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const link = item.querySelector('link').textContent;
    const description = item.querySelector('description').textContent;
    const parsedItem = {
      title,
      link,
      description,
    };
    posts.push(parsedItem);
  });
  return posts;
};

export default (responseData) => {
  const parser = new DOMParser();
  const parsedData = parser.parseFromString(responseData, 'text/xml');
  const parseError = parsedData.querySelector('parsererror');
  if (parseError) {
    const err = new Error(parseError.textContent);
    err.isParserError = true;
    throw err;
  }
  const feed = getFeed(parsedData);
  const posts = getPosts(parsedData);
  return { feed, posts };
};
