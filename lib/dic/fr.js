// /lib/dic/fr.js
export const global = { title: "babaGPT", description: "", conversations: "conversations" }
export const sideBar = {}
export const auth = {
    register: { title: "S'inscrire", Email: "Email", emailPlaceHolder: "votre@email.com" },
    login: { title: "Connexion", enterToken: "Entrez votre jeton :", Email: "Email", emailPlaceHolder: "votre@email.com" },
    chooseAnimalTitle: "Sélectionnez 3 animaux :",
    animalList: [
        { key: "dog", label: "chien" },
        { key: "cat", label: "chat" },
        { key: "elephant", label: "éléphant" },
        { key: "lion", label: "lion" },
        { key: "tiger", label: "tigre" },
        { key: "bear", label: "ours" },
        { key: "monkey", label: "singe" },
        { key: "giraffe", label: "girafe" },
        { key: "zebra", label: "zèbre" },
        { key: "penguin", label: "pingouin" },
        { key: "kangaroo", label: "kangourou" },
        { key: "koala", label: "koala" }
    ],

    OTPTitle: "Ceci est votre jeton à usage unique",
    OTPDescription: "Gardez à l'esprit qu'après chaque connexion, votre jeton changera. Veuillez noter votre nouveau jeton pour les prochaines connexions."
}
export const tokens = {}
export const modelSelection = { noFound: "Aucune persona trouvée." }
