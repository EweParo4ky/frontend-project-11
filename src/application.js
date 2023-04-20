import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import i18next from 'i18next';

import render from './render.js';
import resources from './locales/ru.js'

const validateUrl = (url, savedFeeds) => {
    const schema = yup.string().url().notOneOf(savedFeeds);
    return schema.validate(url);
};

const makeRequest = (url) => {
    return axios.get(url);
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

        sateteUi: {

        },
    };

    const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        submitButton: document.querySelector('button[type="submit"]'),
        feedback: document.querySelector('.feedback'),
    };
    const i18nextInstance = i18next.createInstance();
    const defaultLanguage = 'ru';
    i18nextInstance.init({
        lng: defaultLanguage,
        debug: false,
        resources,
    })
        .then(() => {
            const watchedSate = onChange(initialState, render(initialState, elements, i18nextInstance));

            elements.form.addEventListener('submit', (e) => {
                e.preventDefault();
                watchedSate.formStatus = 'loading';
                const formData = new FormData(e.target);
                const inputUrl = formData.get('url');
                const savedFeeds = initialState.feeds.map((feed) => feed);
                validateUrl(inputUrl, savedFeeds)
                    .then((url) => {
                        initialState.feeds.push(url);
                        console.log(initialState.feeds);
                        watchedSate.formStatus = 'sending';
                        // console.log(makeRequest(url));
                        // return makeRequest(url);
                    })
                    // .then((response) => {
                    //     console.log(response, 'response$$$')
                    // })
                    .catch((error) => {
                        watchedSate.formStatus = 'invalid';
                        watchedSate.errors.push(error);
                    });
                console.log(initialState, 'state!!!');
            });
        })

};