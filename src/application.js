import onChange from 'on-change';
import * as yup from 'yup';

import render from './render';

const validateUrl = (url, savedFeeds) => {
    const schema = yup.string().url().notOneOf(savedFeeds);
    return schema.validate(url);
};

const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedback: document.querySelector('.feedback'),
};

export default () => {
    const initialState = {
        formStatus: 'waiting',
        posts: [],
        feeds: [],
        errors: [],

        sateteUi: {

        },
    }

    const watchedSate = onChange(initialState, render(initialState, elements));

    console.log(elements.form, elements.input, elements.submitButton);
    console.log('hi')

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
            })
            .catch((error) => {
                watchedSate.formStatus = 'invalid';
                watchedSate.errors.push(error);
            });
        console.log(initialState, 'state!!!');
    });
};