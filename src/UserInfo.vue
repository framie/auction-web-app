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
            <h1 id="userTitle" v-if="notFound"> 404: User not found </h1>
            <h1 id="userTitle" v-if="ownProfile && !notFound"> Your Profile </h1>
            <h1 id="userTitle" v-if="!ownProfile"> {{ profile.username }}'s Profile </h1>
            <input type="button" id="backButton" value=" ← Back  " onclick="window.history.back()">
            
            <div id="sideInfo" v-if="!notFound">
                <p v-if="ownProfile"> Username : {{ profile.username }}</p>
                <p v-if="ownProfile"> Email : {{ profile.email }}</p>
                <p v-if="ownProfile"> Account Balance: ${{ profile.accountBalance }} </p>
                <br v-if="ownProfile">
                <p v-if="ownProfile"> Edit your profile details here: </p>
                <p v-if="!ownProfile"> Profile details: </p>
                <br>
                <form id="editDetails" v-if="ownProfile">
                    <p> First name : {{ profile.givenName }} </p>
                    <input type="text" name="firstname" placeholder="new first name">
                    <p> Last name : {{ profile.familyName }} </p>
                    <input type="text" name="lastname" placeholder="new last name">
                    <p> Password </p>
                    <input type="button" id="editButton" value=" Submit " @click="editProfile()">
                </form>
                
                <div v-if="!ownProfile">
                    <p> Username: </p>
                    <p> {{ profile.username }} </p>
                    <br>
                    <p> First name: </p>
                    <p> {{ profile.givenName }} </p>
                    <br>
                    <p> Last name: </p>
                    <p> {{ profile.familyName }} </p>
                </div>
            </div>

            <div id="ongoingAuctions" class="auctionContainer" v-if="!notFound"> 
                <h1 v-if="ownProfile"> Your ongoing auctions </h1>
                <h1 v-if="!ownProfile"> {{ profile.username }}'s ongoing auctions </h1>
                <input type="button" id="toggle1" value=" Show " @click="toggleButton(1)">
                <ul id="list1" class="auctionList" v-if="ongoingAuctions.visible">
                    <li v-for="auction in ongoingAuctions.data" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                    <p v-if="ongoingAuctions.data.length == 0"> No auctions found </p>
                </ul>
            </div>
            <div id="successfulAuctions" class="auctionContainer" v-if="ownProfile && !notFound"> 
                <h1> Your successful auctions </h1>
                <input type="button" id="toggle2" value=" Show " @click="toggleButton(2)">
                <ul id="list2" class="auctionList" v-if="successfulAuctions.visible">
                    <li v-for="auction in successfulAuctions.data" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                    <p v-if="successfulAuctions.data.length == 0"> No auctions found </p>
                </ul>
            </div>
            <div id="unsuccessfulAuctions" class="auctionContainer" v-if="ownProfile && !notFound"> 
                <h1> Your unsuccessful auctions </h1>
                <input type="button" id="toggle3" value=" Show " @click="toggleButton(3)">
                <ul id="list3" class="auctionList" v-if="unsuccessfulAuctions.visible">
                    <li v-for="auction in unsuccessfulAuctions.data" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                    <p v-if="unsuccessfulAuctions.data.length == 0"> No auctions found </p>
                </ul>
            </div>
            <div id="bidAuctions" class="auctionContainer" v-if="ownProfile && !notFound"> 
                <h1> Ongoing auctions you bid on </h1>
                <input type="button" id="toggle4" value=" Show " @click="toggleButton(4)">
                <ul id="list4" class="auctionList" v-if="bidAuctions.visible">
                    <li v-for="auction in bidAuctions.data" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                    <p v-if="bidAuctions.data.length == 0"> No auctions found </p>
                </ul>
            </div>
            <div id="wonAuctions" class="auctionContainer" v-if="ownProfile && !notFound"> 
                <h1> Auctions you won </h1>
                <input type="button" id="toggle5" value=" Show " @click="toggleButton(5)">
                <ul id="list5" class="auctionList" v-if="wonAuctions.visible">
                    <li v-for="auction in wonAuctions.data" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                    <p v-if="wonAuctions.data.length == 0"> No auctions found </p>
                </ul>
            </div>
            
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
            profile: [],
            ownProfile: true,
            ongoingAuctions: { "data": [], visible: false },
            successfulAuctions: { "data": [], visible: false },
            unsuccessfulAuctions: { "data": [], visible: false },
            bidAuctions: { "data": [], visible: false },
            wonAuctions: { "data": [], visible: false },
            notFound: false
        }
    },
    mounted: function() {
        this.checkLoggedIn()
        this.linkColours()
        this.getProfile()
    },
    methods: {
        
        toggleButton: function(val) {
            var button = document.getElementById("toggle" + val)
            if (button.value == " Show ") {
                button.value = " Hide "
            } else {
                button.value = " Show "
            }
            switch (val) {
                case 1:
                    if (this.ongoingAuctions.data.length == 0) {
                        this.getOngoingAuctions()
                    }
                    this.ongoingAuctions.visible = !this.ongoingAuctions.visible
                    break
                case 2:
                    if (this.successfulAuctions.data.length == 0) {
                        this.getSuccessfulAuctions()
                    }
                    this.successfulAuctions.visible = !this.successfulAuctions.visible
                    break
                case 3:
                    if (this.unsuccessfulAuctions.data.length == 0) {
                        this.getUnsuccessfulAuctions()
                    }
                    this.unsuccessfulAuctions.visible = !this.unsuccessfulAuctions.visible
                    break
                case 4:
                    if (this.bidAuctions.data.length == 0) {
                        this.getBidAuctions()
                    }
                    this.bidAuctions.visible = !this.bidAuctions.visible
                    break
                case 5:
                    if (this.wonAuctions.data.length == 0) {
                        this.getWonAuctions()
                    }
                    this.wonAuctions.visible = !this.wonAuctions.visible
                    break
            } 
        },
        
        getOngoingAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/auctions/?seller=' + window.location.pathname.substring(7) + '&' + 'status=active')
                .then(function(response) {
                    this.ongoingAuctions.data = this.ongoingAuctions.data.concat(response.data)
                    console.log(response.data)
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
            this.$http.get('http://localhost:4941/api/v1/auctions/?seller=' + window.location.pathname.substring(7) + '&' + 'status=upcoming')
                .then(function(response) {
                    this.ongoingAuctions.data = this.ongoingAuctions.data.concat(response.data)
                    console.log(response.data)
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getSuccessfulAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/auctions/?seller=' + window.location.pathname.substring(7) + '&' + 'status=won')
                .then(function(response) {
                    this.successfulAuctions.data = response.data
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getUnsuccessfulAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/auctions/?seller=' + window.location.pathname.substring(7) + '&' + 'status=expired')
                .then(function(response) {
                    this.unsuccessfulAuctions.data = response.data
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getBidAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/auctions/?bidder=' + window.location.pathname.substring(7) + '&' + 'status=active')
                .then(function(response) {
                    this.bidAuctions.data = response.data
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getWonAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/my_won_auctions',
                {
                    headers: {
                        'X-Authorization': sessionStorage.getItem("token")
                    }
                })
                .then(function(response) {
                    this.wonAuctions.data = response.data
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getImage: function(auctionId) {
            return "http://localhost:4941/api/v1/auctions/" + auctionId + "/photos" + "?token=" + Date.now()
        },
        
        auctionInfo: function(auctionId) {
            window.location='/auctions/' + auctionId
        },
        
        convertDate: function(phpDate, type) {
            var d = new Date(phpDate)
            var meridiem = "am"
            var output = ""
            var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
            var startStr = "Starts: "
            var endStr = "Ends: "
            if (type == 1 && new Date().getTime() > d.getTime()) {
                startStr = "Started: "
            }
            if (type == 2 && new Date().getTime() > d.getTime()) {
                endStr = "Ended: "
            }
            if (type == 1) {
                output = startStr + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ", "
            } else if (type == 2) {
                output = endStr + d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear() + ", "
            } else if (type == 3) {
                output = "" + d.getDate() + " " + months[d.getMonth()] + ", "
            }
            if (d.getHours() > 12) {
                output += (d.getHours() - 12)
                meridiem = "pm"
            } else if (d.getHours() == 0) {
                 output += 12
            } else {
                output += d.getHours()
            }
            if (d.getMinutes().toString().length == 1){
                output += ":0" + d.getMinutes() + meridiem
            } else {
                output += ":" + d.getMinutes() + meridiem
            }
            return output
        },
        
        getProfile() {
            this.$http.get('http://localhost:4941/api/v1/users/' + window.location.pathname.substring(7),
                    {
                        headers: {
                            'X-Authorization': sessionStorage.getItem("token")
                        }
                    })
                    .then(function(response) {
                        this.profile = response.body
                        if (this.profile.username == this.username) {
                            this.ownProfile = true
                        } else {
                            this.ownProfile = false
                        }
                    }, function(error) {
                        if (error.status == 404) {
                            this.notFound = true
                            return
                        }
                        this.error = error
                        this.errorFlag = true
                    })
        },
        
        editProfile() {
            var form = document.forms.editDetails
            if (!form.firstname.value && !form.lastname.value) {
                alert ("At least one field is required to edit profile")
                return
            } 
            var data = {}
            if (form.firstname.value.length > 0 && this.profile.givenName != form.firstname.value) { data.givenName = form.firstname.value }
            if (form.lastname.value.length > 0 && this.profile.familyName != form.lastname.value) { data.familyName = form.lastname.value }
            
            if (Object.keys(data).length == 0) {
                alert ("At least one field must be different to edit profile")
                return
            } 
            
            this.$http.patch('http://localhost:4941/api/v1/users/' + sessionStorage.getItem("id"), data,
                    {
                        headers: {
                            'X-Authorization': sessionStorage.getItem("token")
                        }
                    }
                )
                .then(function(response) {
                    alert("Successfully edited profile")
                    location.reload()
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
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
                    if (window.location.pathname.substring(1,7) == "users/") {
                        window.location='/users'
                    } else {
                        location.reload()
                    }
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        }
    }
}

</script>