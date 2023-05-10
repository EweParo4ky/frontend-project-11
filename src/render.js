const invalidRender = (elements) => {
  elements.input.classList.add('is-invalid');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-danger');
};

const renderSending = (elements, i18next) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-warning');
  elements.feedback.textContent = i18next.t('status.sending');
};

const renderAdded = (elements, i18next) => {
  elements.input.classList.remove('is-invalid');
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.remove('text-warning');
  elements.feedback.classList.add('text-success');
  elements.feedback.textContent = i18next.t('status.added');
  elements.form.reset();
  elements.input.focus();
};

const renderErrors = (elements, value, i18next) => {
  if (value === null) {
    return;
  }
  const errorText = value.message || value;
  elements.feedback.textContent = i18next.t(`errors.${errorText}`);
};

const renderFormState = (elements, value, i18next) => {
  switch (value) {
    case 'invalid':
      invalidRender(elements);
      break;
    case 'sending':
      renderSending(elements, i18next);
      break;
    case 'added':
      renderAdded(elements, i18next);
      break;
    default:
      break;
  }
};

const makeWrapper = (elements, itemType, i18next) => {
  elements[itemType].textContent = '';
  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

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

  const feeds = state.feeds.map(({ feedTitle, feedDescription }) => {
    const liEl = document.createElement('li');
    liEl.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feedTitle;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feedDescription;

    liEl.append(h3);
    liEl.append(p);
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
    liEl.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');

    const aEl = document.createElement('a');
    aEl.classList.add('fw-bold');
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

const renderViewedPost = (viewedPosts) => {
  const postIds = [...viewedPosts];
  const currentId = postIds[postIds.length - 1];
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

const render = (state, elements, i18next) => (path, value) => {
  switch (path) {
    case 'formStatus':
      renderFormState(elements, value, i18next);
      break;
    case 'feeds':
      renderFeeds(state, elements, i18next);
      break;
    case 'posts':
      renderPosts(state, elements, i18next);
      break;
    case 'stateUi.viewedPosts':
      renderViewedPost(value);
      break;
    case 'stateUi.postIdModal':
      renderModal(state, elements, value);
      break;
    case 'errors':
      renderErrors(elements, value, i18next);
      break;
    default:
      break;
  }
};

export default render;
