import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ScriptX from 'vue-scriptx'
import Ads from 'vue-google-adsense'

const app = createApp(App)

app.use(ScriptX)
app.use(Ads.Adsense, {})

app.mount('#app')