<template>

    <div>
        
        <div id="menu">
            <div>
                <h1 class="centre" id="homeLink" onclick="window.location='/'"> home </h1>
                <h1 class="centre" id="auctionsLink" onclick="window.location='/auctions?q=&count=25'"> auctions </h1>
                <h1 class="centre" id="profileLink" v-if="!loggedIn" onclick="window.location='/users'"> profile </h1>
                <h1 class="centre" id="profileLink" v-if="loggedIn" @click="goToProfile()"> profile </h1>
                <div id="userMenu">
                    <p v-if="!loggedIn"> Not currently logged in </p>
                    <p v-if="loggedIn"> Logged in as: {{ username }} </p>
                    <router-link v-if="!loggedIn" to="/users" tag="button">Create Account / Login</router-link>
                    <button v-if="loggedIn" @click="logout()">Logout</button>
                </div>
            </div>
        </div>
        
        <div id="info" class="homeInfo">
            <h1 id="homeTitle"> hey welcome to my app </h1>
            <p> use the menu bar above to navigate </p>
            <p> have fun </p>
            
            
        </div>
        
        <div v-if="errorFlag" style="color: red;">
            {{ error }}
        </div>
        
    </div>
    
</template>

<script>

export default {
    data (){
        return {
            error: "",
            errorFlag: false,
            loggedIn: false,
            username: "",
            lost: false
        }
    },
    mounted: function() {
        this.checkLoggedIn()
        this.linkColours()
    },
    methods: {
        
        checkLoggedIn() {
            var output = "Not currently logged in"
            if (sessionStorage.getItem("id") != null && sessionStorage.getItem("token") != null) {
                
                this.loggedIn = true
                this.$http.get('http://localhost:4941/api/v1/users/' + sessionStorage.getItem("id"),
                    {
                        headers: {
                            'X-Authorization': sessionStorage.getItem("token")
                        }
                    })
                    .then(function(response) {
                        this.username = response.body.username
                        if (window.location.pathname.substring(1) == "users") {
                            window.location = '/users/' + sessionStorage.getItem("id")
                        }
                    }, function(error) {
                        this.error = error
                        this.errorFlag = true
                    })
            }
        },
        
        linkColours() {
            if (window.location.pathname.length == 1) {
                document.getElementById("homeLink").classList.toggle("highlighted")
            } else if (window.location.pathname.substring(1,9) == "auctions") {
                document.getElementById("auctionsLink").classList.toggle("highlighted")
            } else if (window.location.pathname.substring(1) == "users") {
                document.getElementById("profileLink").classList.toggle("highlighted")
            } else if (window.location.pathname.substring(1,6) == "users" && window.location.pathname.substring(7) == sessionStorage.getItem("id") ) {
                document.getElementById("profileLink").classList.toggle("highlighted")
            }
        },
        
        goToProfile() {
            window.location='/users/' + sessionStorage.getItem('id')
        },
        
        logout() {
            this.$http.post('http://localhost:4941/api/v1/users/logout', {},
                {
                    headers: {
                        'X-Authorization': sessionStorage.getItem("token")
                    }
                })
                .then(function(response) {
                    sessionStorage.clear()
                    location.reload()
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        }
    }
}

</script>