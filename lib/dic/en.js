// /lib/dic/en.js
export const global = { title: "BabaGPT", description: "", conversations: "conversations" }

export const sideBar = {}

export const auth = {
    register: {
        title: "Register",
        Email: "Email",
        emailPlaceHolder: "your@email.com",
        buttonText: "Register",
        submittingText: "Registering...",
        successMessage: "Registration successful!",
        failureMessage: "Registration failed. Please try again.",
        switchToLogin: "Already have an account? Login"
    },
    login: {
        title: "Login",
        enterToken: "Enter your token:",
        Email: "Email",
        emailPlaceHolder: "your@email.com",
        buttonText: "Login",
        submittingText: "Logging in...",
        successMessage: "Login successful!",
        failureMessage: "Login failed. Please try again.",
        switchToRegister: "Need an account? Register"
    },
    chooseAnimalTitle: "Select 3 animals:",
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
    selectAnimalsError: "Please select exactly 3 animals",
    OTPTitle: "This is your one-time Token",
    OTPDescription: "Keep in mind that after each login, your token will change. Please note your new token for future logins."
}

export const tokens = {}
