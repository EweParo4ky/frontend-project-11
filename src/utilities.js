const deleteFeed = (state, elements, i18next, id, renderFeeds, renderPosts) => {
  const filteredFeeds = state.feeds.filter((feed) => feed.id !== id);
  const filteredPosts = state.posts.filter((post) => post.feedId !== id);
  state.feeds = [...filteredFeeds];
  state.posts = [...filteredPosts];
  elements.feedback.textContent = i18next.t('deleting.deleteFeed');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-warning');
  renderFeeds(state, elements, i18next);
  renderPosts(state, elements, i18next);
  if (state.feeds.length === 0) {
    elements.feeds.innerHTML = '';
    elements.feedback.textContent = i18next.t('deleting.deleteAllFeeds');
    elements.feedback.classList.remove('text-warning');
    elements.feedback.classList.add('text-danger');
  }
  if (state.posts.length === 0) {
    elements.posts.innerHTML = '';
  }
};

const makeWrapper = (elements, itemType, i18next) => {
  elements[itemType].textContent = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0', 'bg-light');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body', 'bg-light');

  const title = document.createElement('h2');
  title.classList.add('card-title', 'h4');
  title.textContent = i18next.t(`items.${itemType}`);

  cardBody.append(title);
  card.append(cardBody);

  return card;
};

export { deleteFeed, makeWrapper };
