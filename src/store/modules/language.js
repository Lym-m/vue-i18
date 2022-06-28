const state = () => ({
  language: localStorage.getItem("lang") || "zh",
})

const getters = {
  language: (state) => state.language,
}

const mutations = {
  setLanguage(state, lang) {
    localStorage.setItem("lang", lang);
    state.language = lang;
  },
}
export default { state, getters, mutations}
