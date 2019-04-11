import Vue from 'vue'
import App from './App.vue'
import Home from './Home.vue'
import Users from './Users.vue'
import UserInfo from './UserInfo.vue'
import Auctions from './Auctions.vue'
import AuctionInfo from './AuctionInfo.vue'
import LostPage from './LostPage.vue'
import VueResource from 'vue-resource'
import VueRouter from 'vue-router'

require('./main.css')

Vue.use(VueRouter)
Vue.use(VueResource)
Vue.http.options.emulateJSON = true

const routes = [
    {
        path: "/",
        component: Home
    },
    {
        path: "/users",
        component: Users
    },
    {
        path: "/users/:id",
        component: UserInfo
    },
    {
        path: "/auctions",
        component: Auctions,
    },
    {
        path: "/auctions/:id",
        component: AuctionInfo,
    },
    {
        path: "*",
        component: LostPage,
    },
]
const router = new VueRouter({
    routes: routes,
    mode: 'history'
})

new Vue({
  el: '#app',
    router: router,
  render: h => h(App)
})
