import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';

import render from './render.js';
import resources from './locales/index.js';
import parser from './parser.js';

const validateUrl = (url, linksList) => {
  const schema = yup.string().url().notOneOf(linksList);
  return schema.validate(url);
};

const addProxy = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', url);
  proxyUrl.searchParams.set('disableCache', 'true');
  return proxyUrl.toString();
};

const makeRequest = (proxyUrl) => axios.get(proxyUrl);

const addId = (posts, feedId) => {
  const postsWithID = posts.map((post) => {
    const item = {
      ...post,
      id: _.uniqueId(),
      feedId,
    };
    return item;
  });
  return postsWithID;
};

const handleError = (error) => {
  if (error.isParserError) {
    return 'notContainRSS';
  }
  if (axios.isAxiosError(error)) {
    return 'networkError';
  }
  return error.message;
};

const updatePosts = (watchedState) => {
  const timeoutUpdate = 5000;
  const promises = watchedState.feeds.map((feed) => {
    const proxyUrl = addProxy(feed.link);
    return makeRequest(proxyUrl)
      .then((response) => {
        const { posts } = parser(response.data.contents);
        const savedPosts = watchedState.posts;
        const postsWithCurrentId = savedPosts.filter((post) => post.feedId === feed.id);
        const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
        const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
        const newPostsWithID = addId(newPosts, feed.id);
        watchedState.posts.unshift(...newPostsWithID);
      })
      .catch((err) => console.error(`Error: ${err}`));
  });
  Promise.all(promises)
    .then(() => setTimeout(() => updatePosts(watchedState), timeoutUpdate));
};

const application = () => {
  yup.setLocale({
    mixed: {
      notOneOf: 'alreadyExists',
      required: 'required',
    },
    string: {
      url: 'invalidURL',
    },
  });

  const initialState = {
    requestStatus: 'waiting',
    formStatus: 'filling',
    posts: [],
    feeds: [],
    errors: [],
    stateUi: {
      viewedPosts: new Set(),
      postIdModal: null,
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    removeButton: '',
    feedback: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: {
      title: document.querySelector('.modal-title'),
      body: document.querySelector('.modal-body'),
      link: document.querySelector('.full-article'),
    },
  };

  const i18nextInstance = i18next.createInstance();
  const defaultLanguage = 'ru';
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: false,
    resources,
  })
    .then(() => {
      const watchedState = onChange(initialState, render(initialState, elements, i18nextInstance));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const inputUrl = formData.get('url');
        const linksList = initialState.feeds.map((feed) => feed.link);
        watchedState.requestStatus = 'sending';

        validateUrl(inputUrl, linksList)
          .then((url) => {
            watchedState.errors = null;
            const proxyUrl = addProxy(url);
            return makeRequest(proxyUrl);
          })
          .then((response) => {
            const responseData = response.data.contents;
            const { feed, posts } = parser(responseData);
            feed.link = inputUrl;
            feed.id = _.uniqueId();
            const postsWithId = addId(posts, feed.id);
            watchedState.feeds = [feed, ...initialState.feeds];
            watchedState.posts = [...postsWithId, ...initialState.posts];
            watchedState.requestStatus = 'loaded';
            watchedState.formStatus = 'filling';
            elements.removeButton = document.querySelector('.rm-btn');
            elements.removeButton.addEventListener('click', (event) => {
              // console.log('Boom!');
              const currentFeedId = event.target.dataset.id;
              // console.log('data-id feed', currentFeedId, typeof currentFeedId);
              // console.log(watchedState.feeds);
              const removedFeeds = watchedState.feeds.filter((el) => el.id !== currentFeedId);
              // console.log('filtered', removedFeeds);
              watchedState.feeds = removedFeeds;
            });
          })
          .catch((error) => {
            watchedState.requestStatus = 'failed';
            watchedState.formStatus = 'invalid';
            watchedState.errors = handleError(error);
          });
      });

      elements.posts.addEventListener('click', (e) => {
        const currentPostId = e.target.dataset.id;
        if (currentPostId) {
          watchedState.stateUi.viewedPosts.add(currentPostId);
          watchedState.stateUi.postIdModal = currentPostId;
        }
      });
      updatePosts(watchedState);
    });
};
export default application;
