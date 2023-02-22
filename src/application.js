import onChange from 'on-change';
import * as yup from 'yup';

import validRender from './render';

const validateUrl = (url, savedFeeds) => {
    const schema = yup.string().url().notOneOf(savedFeeds);
    return schema.validate(url);
};

const elements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    submitButton: document.querySelector('button[type="submit"]'),
};

export default () => {
    const initialState = {
        status: 'waiting',
        form: {
            valid: false,
            errors: [],
        },
        sateteUi: {

        },
        posts: [],
        feeds: [],
    }

    const watchedSate = onChange(initialState, (path, value) => {
        switch(path) {
            case 'form.valid': {
                validRender(elements, initialState, value)
            }
        }
    });

    console.log(elements.form, elements.input, elements.submitButton);
    console.log('hi')

    elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        watchedSate.status = 'loading';
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const savedFeeds = initialState.feeds.map((feed) => feed);
        validateUrl(url, savedFeeds)
        .then((url) => initialState.feeds.push(url))
        .then(() => console.log(initialState.feeds))
        watchedSate.form.valid = true;
    })
};