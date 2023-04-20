const getFeed = (parsedData) => {
const feedTitle = parsedData.querySelector('title').textContent;
const feedDescription = parsedData.querySelector('description').textContent;
return { feedTitle, feedDescription };
};

export default (responseData) => {
const parser = new DOMParser();
const parsedData = parser.parseFromString(responseData, 'application/xml');
const parseError = parsedData.querySelector('parsererror');
if (parseError) {
    throw new Error('notContainRSS');
  }
const feed = getFeed(parsedData);
return { feed };
}