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

const makeRequest = (url) => {
  const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('url', url);
  proxyUrl.searchParams.set('disableCache', 'true');
  return axios.get(proxyUrl.toString());
};

const addId = (posts, feedId) => {
  const postsWithID = posts.map((post) => {
    post.feedId = feedId;
    post.id = _.uniqueId();
    return post;
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
  const promises = watchedState.feeds.map((feed) => makeRequest(feed.link)
    .then((response) => {
      const { posts } = parser(response.data.contents);
      const savedPosts = watchedState.posts;
      const postsWithCurrentId = savedPosts.filter((post) => post.feedId === feed.id);
      const displayedPostLinks = postsWithCurrentId.map((post) => post.link);
      const newPosts = posts.filter((post) => !displayedPostLinks.includes(post.link));
      const newPostsWithID = addId(newPosts, feed.id);
      watchedState.posts.unshift(...newPostsWithID);
    })
    .catch((err) => console.log(`Error: ${err}`)));
  Promise.all(promises)
    .then(() => setTimeout(() => updatePosts(watchedState), 5000));
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
        validateUrl(inputUrl, linksList)
          .then((url) => {
            watchedState.requestStatus = 'sending';
            watchedState.errors = null;
            return makeRequest(url);
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
