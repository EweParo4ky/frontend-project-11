const invalidRender = (elements) => {
    elements.input.classList.add('is-invalid');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.remove('text-warning');
    elements.feedback.classList.add('text-danger');
    elements.feedback.textContent = 'Error. This must be a valid URL!!!';
}

const renderSending = (elements) => {
    elements.input.classList.remove('is-invalid');
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-warning');
    elements.feedback.textContent = 'sending';
}

const renderFormState = (elements, value) => {
    switch (value) {
        case 'invalid':
            invalidRender(elements);
            break;
        case 'sending':
            renderSending(elements);
            break;
        default:
            break;
    }
}

const render = (initialState, elements) => (path, value) => {
    switch (path) {
        case 'formStatus':
            renderFormState(elements, value);
            break;
        default:
            break;
    }
}

export default render;