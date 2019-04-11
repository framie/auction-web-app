<template>

    <div>
        
        <div id="menu">
            <div>
                <h1 id="homeLink" onclick="window.location='/'"> home </h1>
                <h1 id="auctionsLink" onclick="window.location='/auctions?q=&count=25'"> auctions </h1>
                <h1 id="profileLink" v-if="!loggedIn"  onclick="window.location='/users'"> profile </h1>
                <h1 id="profileLink" v-if="loggedIn" @click="goToProfile('self')"> profile </h1>
                <div id="userMenu">
                    <p v-if="!loggedIn"> Not currently logged in </p>
                    <p v-if="loggedIn"> Logged in as: {{ username }} </p>
                    <router-link v-if="!loggedIn" to="/users" tag="button">Create Account / Login</router-link>
                    <button v-if="loggedIn" @click="logout()">Logout</button>
                </div>
            </div>
        </div>
        
        <div id="info" class="userInfo">
            <h1 id="userTitle"> Registration </h1>
            <input type="button" id="backButton" value=" ← Back  " onclick="window.history.back()">
            
            <div id="sideInfo">
                <p> Already have an account? </p>
                <p> Login here! </p>
                <form id="loginDetails">
                    <input type="text" name="username" placeholder="username or email">
                    <input type="password" name="password" placeholder="password">
                    <input type="button" id="loginButton" value=" Submit " @click="login()">
                </form>
            </div>
            
            <form id="registerDetails">
                <div id="accountDetails">
                    <h1> Account Details </h1>
                    <p> Username </p>
                    <input type="text" name="username" required>
                    <p> Email </p>
                    <input type="email" name="email" required>
                    <p> Password </p>
                    <input type="password" name="password" required>
                    <p> Confirm password </p>
                    <input type="password" name="password2" required>
                </div>
                
                <div id="contactDetails">
                    <h1> Contact Details </h1>
                    <p> First name </p>
                    <input type="text" name="firstname" required>
                    <p> Last name </p>
                    <input type="text" name="lastname" required> <br>
                    <input type="button" id="registerButton" value=" Submit " @click="register()">
                </div>
            </form>
            
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
            username: ""
        }
    },
    mounted: function() {
        this.checkLoggedIn()
        this.linkColours()
    },
    methods: {

        register: function() {
            var form = document.forms.registerDetails
            if (!form.email.checkValidity()) {
                alert ("Email is invalid")
                return
            } else if (form.password.value != form.password2.value) {
                alert ("Passwords do not match, please try again")
                return
            } else if (!form.checkValidity()) {
                alert ("All registration fields are required")
                return
            }
            var data = {
                "username": form.username.value,
                "givenName": form.firstname.value,
                "familyName": form.lastname.value,
                "email": form.email.value,
                "password": form.password.value
            }
            this.$http.post('http://localhost:4941/api/v1/users', data)
                .then(function(response) {
                    var data = {
                        "username": form.username.value,
                        "email": form.username.value,
                        "password": form.password.value
                    }
                    this.$http.post('http://localhost:4941/api/v1/users/login', data)
                        .then(function(response) {
                            sessionStorage.setItem("id", response.body.id)
                            sessionStorage.setItem("token", response.body.token)
                            window.location = '/users/' + response.body.id
                        })
                }, function(error) {
                    alert("Username or email already taken")
                })
        },
        
        login: function() {
            var form = document.forms.loginDetails
            if ((!form.username.value || !form.password.value)) {
                alert("All login fields required")
                return
            }
            var data = {
            "username": form.username.value,
            "email": form.username.value,
            "password": form.password.value
            }
            
            this.$http.post('http://localhost:4941/api/v1/users/login', data)
                .then(function(response) {
                    sessionStorage.setItem("id", response.body.id)
                    sessionStorage.setItem("token", response.body.token)
                    window.history.back()
                }, function(error) {
                    alert("Incorrect login details")
                })
        },
        
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
        
        goToProfile(id) {
            if (!this.loggedIn) {
                alert("You must be logged in to visit a user's profile")
            } else if (isNaN(id)) {
                window.location='/users/' + sessionStorage.getItem('id')
            } else {
                window.location='/users/' + id
            }
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