import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import ScriptX from 'vue-scriptx'
import Ads from 'vue-google-adsense'

const app = createApp(App)

app.use(ScriptX)
app.use(Ads.AutoAdsense, { adClient: 'ca-pub-8117946503724556', isNewAdsCode: true })

app.mount('#app')