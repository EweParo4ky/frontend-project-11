import i18next from "i18next";

const invalidRender = (elements) => {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.remove('text-warning');
    elements.feedback.classList.add('text-danger');
}

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
    };
    const errorText = value.message || value;
    elements.feedback.textContent = i18next.t(`errors.${errorText}`);
}

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
        default:
            break;
    };
};

const makeWrapper = (itemType, i18next) => {
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
    feeds.forEach(li => {
        list.append(li)
    });

    const wrapper = makeWrapper('feeds', i18next);
    wrapper.append(list);
    elements.feeds.append(wrapper);
};

const render = (state, elements, i18next) => (path, value) => {
    switch (path) {
        case 'formStatus':
            renderFormState(elements, value, i18next);
            break;
        case 'feeds':
            renderFeeds(state, elements, i18next);
            break;
        case 'errors':
            renderErrors(elements, value, i18next);
            break;
        default:
            break;
    }
}

export default render;