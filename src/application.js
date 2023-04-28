import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';

import render from './render.js';
import resources from './locales/ru.js';
import parser from './parser.js';

const validateUrl = (url, savedFeeds) => {
    const schema = yup.string().url().notOneOf(savedFeeds);
    return schema.validate(url);
};

const makeRequest = (url) => {
    const proxyUrl = new URL('/get', 'https://allorigins.hexlet.app');
    proxyUrl.searchParams.set('url', url);
    proxyUrl.searchParams.set('disableCache', 'true');
    return axios.get(proxyUrl);
};

const addId = (posts, feedId) => {
    posts.forEach((post) => {
        post.feedId = feedId;
        post.id = _.uniqueId();
    });
};

export default () => {
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
        formStatus: 'waiting',
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
            link: document.querySelector('.full-article')
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
                watchedState.formStatus = 'loading';
                const formData = new FormData(e.target);
                const inputUrl = formData.get('url');
                const savedFeeds = initialState.feeds.map((feed) => feed.url);
                validateUrl(inputUrl, savedFeeds)
                    .then((url) => {
                        console.log(initialState.feeds);
                        watchedState.formStatus = 'sending';
                        watchedState.errors = null;
                        console.log(makeRequest(url));
                        return makeRequest(url);
                    })
                    .then((response) => {
                        const responseData = response.data.contents;
                        console.log('responseData', responseData);
                        console.log(response, 'response$$$');
                        const { feed, posts } = parser(responseData);
                        feed.url = inputUrl;
                        feed.id = _.uniqueId();
                        addId(posts, feed.id);
                        console.log(feed, 'feed');
                        console.log(posts, 'posts');
                        watchedState.feeds = [feed, ...initialState.feeds];
                        watchedState.posts = [...posts, ...initialState.posts];
                        watchedState.formStatus = 'added';
                    })
                    .catch((error) => {
                        watchedState.formStatus = 'invalid';
                        watchedState.errors = error.isAxiosError ? 'networkError' : error.message;
                    });
                console.log(initialState, 'state!!!');
            });
            elements.posts.addEventListener('click', (e) => {
                const currentPostId = e.target.dataset.id;
                if (currentPostId) {
                    watchedState.stateUi.viewedPosts.add(currentPostId);
                    watchedState.stateUi.postIdModal = currentPostId;
                }
                console.log(watchedState.stateUi, 'watchedState@@@@@@@@@@@@');
            });
        });
};