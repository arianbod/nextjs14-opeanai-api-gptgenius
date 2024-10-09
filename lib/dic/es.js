// /lib/dic/es.js
export const global = { title: "babaGPT", description: "", conversations: "conversaciones" }
export const sideBar = {}
export const auth = {
    register: { title: "Registrarse", Email: "Correo Electrónico", emailPlaceHolder: "your@email.com" },
    login: { title: "Iniciar Sesión", enterToken: "Ingresa tu token:", Email: "Correo Electrónico", emailPlaceHolder: "your@email.com" },
    chooseAnimalTitle: "Selecciona 3 animales:",
    animalList: [
        { key: "dog", label: "perro" },
        { key: "cat", label: "gato" },
        { key: "elephant", label: "elefante" },
        { key: "lion", label: "león" },
        { key: "tiger", label: "tigre" },
        { key: "bear", label: "oso" },
        { key: "monkey", label: "mono" },
        { key: "giraffe", label: "jirafa" },
        { key: "zebra", label: "cebra" },
        { key: "penguin", label: "pingüino" },
        { key: "kangaroo", label: "canguro" },
        { key: "koala", label: "koala" }
    ],

    OTPTitle: "Este es tu Token de un solo uso",
    OTPDescription: "Ten en cuenta que después de cada inicio de sesión, tu token cambiará. Por favor, anota tu nuevo token para futuros inicios de sesión."
}
export const tokens = {}
export const modelSelection = { noFound: "No se encontraron personas." }
