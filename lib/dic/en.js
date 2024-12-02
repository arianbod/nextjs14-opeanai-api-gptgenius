// /lib/dic/en.js
export const global = {
    title: "BabaAI",
    description: "",
    conversations: "conversations"
};

export const sideBar = {};

export const auth = {
    register: {
        title: "Register",
        email: "Email",
        emailPlaceholder: "your@email.com",    // Matches screenshot
        buttonText: "Register",
        submitting: "Registering...",         // Used in submit button when loading
        submit: "Register",                   // Used in submit button
        successMessage: "Registration successful!",
        failureMessage: "Registration failed. Please try again.",
        switchToLogin: "Already have an account? Login",
        info: "Create an account by selecting 3 animals in a sequence. You'll need to remember this exact sequence to log in."
    },
    login: {
        title: "Login",
        token: "Token",
        tokenPlaceholder: "Enter your token",  // Simplified as shown in screenshot
        buttonText: "Login",
        submitting: "Logging in...",
        submit: "Login",
        successMessage: "Login successful!",
        failureMessage: "Login failed. Please try again.",
        switchToRegister: "Need an account? Register",
        info: "Enter your token and select your 3 animals in the exact same order as during registration."
    },
    // Used in animal selection section
    selectAnimalsInOrder: "Select 3 animals:",  // Matches screenshot
    selectedAnimalsOrder: "(0/3)",              // Matches screenshot's counter
    selectNext: "Select next animal",
    animalList: [
        { key: "dog", label: "dog" },
        { key: "cat", label: "cat" },
        { key: "elephant", label: "elephant" },
        { key: "lion", label: "lion" },
        { key: "tiger", label: "tiger" },
        { key: "bear", label: "bear" },
        { key: "monkey", label: "monkey" },
        { key: "giraffe", label: "giraffe" },
        { key: "zebra", label: "zebra" },
        { key: "penguin", label: "penguin" },
        { key: "kangaroo", label: "kangaroo" },
        { key: "koala", label: "koala" }
    ],
    // Used in error handling
    selectThreeAnimalsInOrder: "Please select exactly 3 animals in order",

    // Used in token modal
    saveToken: "Save Your Token",
    tokenImportant: "Important: Save this token - you'll need it to log in.",
    tokenCopied: "Token copied!",
    orderMatters: "The order of animal selection matters!",
    understood: "I've saved my token",
    rememberAnimalOrder: "Remember your sequence:",
    genericError: "An error occurred. Please try again."
};

export const tokens = {};