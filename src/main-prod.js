/* eslint-disable eol-last */
/* eslint-disable indent */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// import './plugins/element.js'
import './assets/fonts/iconfont.css'
import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'

// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'

import Nprogress from 'nprogress'

// 配置请求的根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
    // 在request拦截器中，展示进度条 Nprogress.start()
axios.interceptors.request.use(config => {
        Nprogress.start()
        config.headers.Authorization = window.sessionStorage.getItem('token')
            // 必须在最后返回config
        return config
    })
    // 在response拦截器中，隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config => {
    Nprogress.done()
    return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
    // 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

Vue.filter('dataFormat', function(originVal) {
    const dt = new Date(originVal)

    const y = dt.getFullYear()
    const m = (dt.getMonth() + 1 + '').padStart(2, '0')
    const d = (dt.getDate() + 1 + '').padStart(2, '0')

    const hh = (dt.getHours() + 1 + '').padStart(2, '0')
    const mm = (dt.getMinutes() + 1 + '').padStart(2, '0')
    const ss = (dt.getSeconds() + 1 + '').padStart(2, '0')

    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')