import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import App from './App.vue'
import router from './router'
import { createToastPlugin } from './plugins/toast'
import './styles/main.css'

gsap.registerPlugin(ScrollTrigger)

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(createToastPlugin())
app.mount('#app')
