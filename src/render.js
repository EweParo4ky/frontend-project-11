const renderForm = (elements, value) => {
  switch (value) {
    case 'invalid':
      elements.submitButton.removeAttribute('disabled');
      elements.input.removeAttribute('disabled');
      elements.input.classList.add('is-invalid');
      elements.feedback.classList.remove('text-success');
      elements.feedback.classList.remove('text-warning');
      elements.feedback.classList.add('text-danger');
      break;
    case 'filling':
      elements.feedback.classList.remove('text-danger');
      elements.feedback.classList.remove('text-warning');
      elements.feedback.classList.add('text-success');
      break;
    default:
      break;
  }
};

const renderWaiting = (elements) => {
  elements.submitButton.removeAttribute('disabled');
  elements.input.removeAttribute('disabled');
  elements.input.classList.remove('is-invalid');
};

const renderSending = (elements, i18next) => {
  elements.submitButton.setAttribute('disabled', true);
  elements.input.setAttribute('disabled', true);
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-warning');
  elements.feedback.textContent = i18next.t('status.sending');
};

const renderLoaded = (elements, i18next) => {
  elements.submitButton.removeAttribute('disabled');
  elements.input.removeAttribute('disabled');
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18next.t('status.loaded');
  elements.form.reset();
  elements.input.focus();
};

const renderFailed = (elements) => {
  elements.submitButton.removeAttribute('disabled');
  elements.input.removeAttribute('disabled');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-danger');
};

const renderErrors = (elements, value, i18next) => {
  if (value === null) {
    return;
  }
  const errorText = value.message || value;
  elements.feedback.textContent = i18next.t(`errors.${errorText}`);
};

const renderRequest = (elements, value, i18next) => {
  switch (value) {
    case 'waiting':
      renderWaiting(elements);
      break;
    case 'sending':
      renderSending(elements, i18next);
      break;
    case 'loaded':
      renderLoaded(elements, i18next);
      break;
    case 'failed':
      renderFailed(elements);
      break;
    default:
      break;
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

const renderFeeds = (state, elements, i18next) => {
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  const feeds = state.feeds.map(({ feedTitle, feedDescription, id }) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0', 'bg-light');

    const removeBtn = document.createElement('button');
    removeBtn.setAttribute('type', 'button');
    removeBtn.setAttribute('data-id', id);
    removeBtn.classList.add('btn', 'btn-warning', 'btn-sm', 'rm-btn');
    removeBtn.textContent = i18next.t('items.removeBtn');

    removeBtn.addEventListener('click', () => {
      const filteredFeeds = state.feeds.filter((feed) => feed.id !== id);
      const filteredPosts = state.posts.filter((post) => post.feedId !== id);
      state.feeds = [...filteredFeeds];
      state.posts = [...filteredPosts];
      console.log('state.feeds', state);
      renderFeeds(state, elements, i18next);
      // eslint-disable-next-line no-use-before-define
      renderPosts(state, elements, i18next);
      if (state.feeds.length === 0) {
        elements.feeds.innerHTML = '';
      }
      if (state.posts.length === 0) {
        elements.posts.innerHTML = '';
      }
    });

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feedTitle;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feedDescription;

    liEl.append(h3);
    liEl.append(p);
    liEl.append(removeBtn);
    return liEl;
  });
  feeds.forEach((li) => {
    list.append(li);
  });

  const wrapper = makeWrapper(elements, 'feeds', i18next);
  wrapper.append(list);
  elements.feeds.append(wrapper);
};

const renderPosts = (state, elements, i18next) => {
  const list = document.createElement('ul');
  list.classList.add('list-group', 'border-0', 'rounded-0');

  const posts = state.posts.map((post) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0', 'bg-light');

    const aEl = document.createElement('a');
    if (state.stateUi.viewedPosts.has(post.id)) {
      aEl.classList.add('fw-normal', 'link-secondary');
    } else {
      aEl.classList.add('fw-bold');
    }
    aEl.setAttribute('href', post.link);
    aEl.setAttribute('data-id', post.id);
    aEl.setAttribute('target', '_blank');
    aEl.setAttribute('rel', 'noopener noreferrer');
    aEl.textContent = post.title;

    liEl.append(aEl);

    const btnEl = document.createElement('button');
    btnEl.setAttribute('type', 'button');
    btnEl.setAttribute('data-id', post.id);
    btnEl.setAttribute('data-bs-toggle', 'modal');
    btnEl.setAttribute('data-bs-target', '#modal');
    btnEl.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    btnEl.textContent = i18next.t('items.btn');

    liEl.append(btnEl);

    return liEl;
  });
  posts.forEach((post) => {
    list.append(post);
  });

  const wrapper = makeWrapper(elements, 'posts', i18next);
  wrapper.append(list);
  elements.posts.append(wrapper);
};

const renderViewedPosts = (viewedPostIds) => {
  const postIds = [...viewedPostIds];
  const currentId = postIds.at(-1);
  const currentPost = document.querySelector(`[data-id="${currentId}"]`);
  currentPost.classList.remove('fw-bold');
  currentPost.classList.add('fw-normal', 'link-secondary');
};

const renderModal = (state, elements, postId) => {
  const postInModal = state.posts.filter((post) => post.id === postId);
  const [{ description, link, title }] = postInModal;
  elements.modal.title.textContent = title;
  elements.modal.body.textContent = description;
  elements.modal.link.setAttribute('href', link);
};

const renderTheme = (state) => {
  const container = document.querySelector('.theme-bg');
  const textContainer = document.querySelector('.theme-text');
  const footer = document.querySelector('footer');
  if (state.darkTheme) {
    container.classList.remove('bg-dark');
    container.classList.add('bg-light');
    textContainer.classList.remove('text-white');
    footer.classList.remove('bg-dark');
    footer.classList.add('bg-light');
  } else {
    container.classList.remove('bg-light');
    container.classList.add('bg-dark');
    textContainer.classList.add('text-white');
    footer.classList.remove('bg-light');
    footer.classList.add('bg-dark');
  }
};

const render = (state, elements, i18next) => (path, value) => {
  switch (path) {
    case 'formStatus':
      renderForm(elements, value);
      break;
    case 'requestStatus':
      renderRequest(elements, value, i18next);
      break;
    case 'feeds':
      renderFeeds(state, elements, i18next);
      break;
    case 'posts':
      renderPosts(state, elements, i18next);
      break;
    case 'stateUi.viewedPosts':
      renderViewedPosts(value);
      break;
    case 'stateUi.postIdModal':
      renderModal(state, elements, value);
      break;
    case 'darkTheme':
      renderTheme(state);
      break;
    case 'errors':
      renderErrors(elements, value, i18next);
      break;
    default:
      break;
  }
};

export default render;
