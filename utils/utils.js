export const getTextDirection = (text) => {
    const persianRegex = /^[\u0600-\u06FF]/;
    if (persianRegex.test(text)) {
        return 'text-right rtl';
    }
    return 'text-left ltr';
};
