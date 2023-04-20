const invalidRender = (elements) => {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.remove('text-warning');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = 'Error. This must be a valid URL!!!';
}

const renderSending = (elements, i18next) => {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-warning');
    elements.feedback.textContent = i18next.t('status.sending');
};

const renderAdded = (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.remove('text-warning');
    elements.feedback.classList.add('text-success');
    elements.form.reset();
    elements.input.focus();
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
            renderAdded(elements);
        default:
            break;
    }
}

const render = (initialState, elements, i18next) => (path, value) => {
    switch (path) {
        case 'formStatus':
            renderFormState(elements, value, i18next);
            break;
        default:
            break;
    }
}

export default render;