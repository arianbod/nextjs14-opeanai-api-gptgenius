// /lib/dic/tr.js
export const global = { title: "babaGPT", description: "", conversations: "konuşmalar" }
export const sideBar = {}
export const auth = {
    register: { title: "Kayıt Ol", Email: "E-posta", emailPlaceHolder: "your@email.com" },
    login: { title: "Giriş Yap", enterToken: "Token'ınızı girin:", Email: "E-posta", emailPlaceHolder: "your@email.com" },
    chooseAnimalTitle: "3 hayvan seçin:",
    animalList: [
        { key: "dog", label: "köpek" },
        { key: "cat", label: "kedi" },
        { key: "elephant", label: "fil" },
        { key: "lion", label: "aslan" },
        { key: "tiger", label: "kaplan" },
        { key: "bear", label: "ayı" },
        { key: "monkey", label: "maymun" },
        { key: "giraffe", label: "zürafa" },
        { key: "zebra", label: "zebra" },
        { key: "penguin", label: "penguen" },
        { key: "kangaroo", label: "kanguru" },
        { key: "koala", label: "koala" }
    ],

    OTPTitle: "Bu bir kerelik Token'ınız",
    OTPDescription: "Her girişten sonra token'ınızın değişeceğini unutmayın. Lütfen gelecekteki girişler için yeni token'ınızı not edin."
}
export const tokens = {}
export const modelSelection = { noFound: "Hiç persona bulunamadı." }
