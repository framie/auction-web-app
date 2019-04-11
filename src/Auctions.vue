<template>

    <div>
        
        <div id="menu" class="auctionsPage">
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
        
        <div id="info" class="auctionPage">
        
            <div id="auctions">
                <h1> Showing {{ getCountVal() }} of {{ totalAuctions }} results </h1 >
                <ul>
                    <li v-for="auction in auctions" :id="auction.id" @click="auctionInfo(auction.id)"> 
                        <div>
                            <img :src="getImage(auction.id)">
                        </div>
                        <p> {{ auction.title }} </p> 
                        <p> {{ convertDate(auction.startDateTime, 1) }} </p>
                        <p> {{ convertDate(auction.endDateTime, 2) }} </p>
                    </li>
                </ul>

                <div id="footer">
                    <div id="pageSelector" v-if="totalAuctions > 5">
                        <p id="p1" v-if="pageNum > 2" @click="pageHandler(-2)"> {{ pageNum - 2 }} </p>
                        <p id="p2" v-if="pageNum > 1" @click="pageHandler(-1)"> {{ pageNum - 1 }} </p>
                        <p id="p3" class="current"> {{ pageNum }} </p>
                        <p id="p4" v-if="pageNum < pageTotal" @click="pageHandler(1)"> {{ pageNum + 1 }} </p>
                        <p id="p5" v-if="pageNum < pageTotal - 1" @click="pageHandler(2)"> {{ pageNum + 2 }} </p>
                    </div>
                </div>
            </div>
            
            <div id="sideHolder">
                <input type="button" id="backButton" value=" ← Back  " onclick="window.history.back()">
                <div id="sideInfo" class="auctionPage">
                    <input type="button" value="Create auction" v-if="loggedIn" data-toggle="modal" data-target="#createAuctionModal">
                    <input type="button" value="Create auction" v-if="!loggedIn" @click="createAuction()">
                    <input type="button" value="View your auctions" @click="goToProfile('self')">
                    <form id="filter">
                        <h1> Search </h1>
                        <input type="search" name="q">
                        <h1> Category </h1>
                        <input type="radio" name="category-id" value="1"> Apparel <br>
                        <input type="radio" name="category-id" value="2"> Equipment <br>
                        <input type="radio" name="category-id" value="3"> Vehicles <br>
                        <input type="radio" name="category-id" value="4"> Property <br>
                        <input type="radio" name="category-id" value="5"> Other <br>
                        <h1> Status </h1>
                        <input type="radio" name="status" value="all" checked> All <br>
                        <input type="radio" name="status" value="active"> Active <br>
                        <input type="radio" name="status" value="expired"> Expired <br>
                        <input type="radio" name="status" value="won"> Won <br>
                        <input type="radio" name="status" value="upcoming"> Upcoming <br>
                        <br>
                        Results per page:
                        <select name="count">
                            <option value="10"> 10 </option>
                            <option value="25" selected> 25 </option>
                            <option value="50"> 50 </option>    
                            <option value="75"> 75 </option>
                        </select> <br>
                        <br>
                        <input type="submit" value="Filter results">
                    </form>
                </div>
            </div>    
                
        </div>
        
        <div v-if="errorFlag" style="color: red;">
            {{ error }}
        </div>
        
        <div class="modal fade" id="createAuctionModal" tabindex="-1" role="dialog"aria-labelledby="createAuctionModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="createAuctionModalLabel"> Create Auction </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form name="auctionDetails">
                        
                            <div id="leftSide">
                                <h1> Auction details: </h1>
                                <p> Title: <input type="text" name="title" required> </p>
                                <p> Category:
                                    <select name="category">
                                        <option value="1"> Apparel </option>
                                        <option value="2"> Equipment </option>
                                        <option value="3"> Vehicles </option>    
                                        <option value="4"> Property </option>
                                        <option value="5"> Other </option>
                                    </select>
                                </p>
                                <p> Start date: <input type="datetime-local" name="startDate" :value="getCurrentDate()" required> </p>
                                <p> End date: <input type="datetime-local" name="endDate" :value="getCurrentDate()" required> </p>
                                <p> Starting Bid: <input type="text" name="startingBid" value="$0" required> </p>
                                <p> Reserve Price: <input type="text" name="reservePrice" value="$0" required> </p>
                                <p> Description: </p>
                                <textarea name="description" required> </textarea> 
                            </div>
                            
                            <div id="rightSide">
                                <h1> Image preview: </h1>
                                <div id="imgHolder">
                                    <img id="imgPreview" src="./default.png">
                                </div>
                                <p> Upload a new image: <input type="file" name="photo" @change="previewImage()"> </p>
                            </div>
                        
                        </form>
                    </div>
                    <div class="modal-footer">
                        <input type="button" id="submitAuction" @click="createAuction()" value="Confirm">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>

    </div>
    
</template>

<script>

export default {
    data (){
        return {
            error: "",
            errorFlag: false,
            auctions: "",
            loggedIn: false,
            username: "",
            totalAuctions: 0,
            pageNum: 1,
            pageTotal: 1
        }
    },
    mounted: function() {
        this.getAuctions()
        this.getTotalAuctions()
        this.checkLoggedIn()
        this.linkColours()        
    },
    methods: {
        
        createAuction: function() {
            var form = document.forms.auctionDetails
            var start = new Date(form.startDate.value).getTime()
            var end = new Date(form.endDate.value).getTime()
            var now = new Date().getTime()
            if (!this.loggedIn) {
                alert("You must be logged in to create an auction")
                return
            }
            if (!form.startDate.checkValidity() || !form.endDate.checkValidity()) {
                alert("Start date and end date must both be valid")
                return
            }
            if (form.startingBid.value[0] == "$") {
                form.startingBid.value = form.startingBid.value.substr(1)
            }
            if (form.reservePrice.value[0] == "$") {
                form.reservePrice.value = form.reservePrice.value.substr(1)
            }
            if (isNaN(form.reservePrice.value) || isNaN(form.startingBid.value)) {
                alert("Starting bid and reserve price must both be numbers")
                return
            }
            if (now >= start) {
                alert("You must pick a later start date")
                return
            }
            if (now >= end) {
                alert("You must pick a later end date")
                return
            }
            if (start >= end) {
                alert("End date must be later than start date")
                return
            }
            if (!form.checkValidity()) {
                alert ("All auction detail fields are required")
                return
            }
            var data = {
                "categoryId": parseInt(form.category.value),
                "title": form.title.value,
                "description": form.description.value,
                "startDateTime": start,
                "endDateTime": end,
                "reservePrice": parseInt(form.reservePrice.value),
                "startingBid": parseInt(form.startingBid.value)
            }
            console.log(data)
            this.$http.post('http://localhost:4941/api/v1/auctions', data,
                {
                    emulateJSON: false,
                    headers: {
                        'X-Authorization': sessionStorage.getItem("token")
                    }
                })
                .then(function(response) {
                    var id = response.body.id
                    if (document.forms.auctionDetails.photo.files.length > 0) {
                        var photo = document.forms.auctionDetails.photo.files[0]
                        this.$http.post('http://localhost:4941/api/v1/auctions/' + id + '/photos' , photo,
                            {
                                emulateJSON: false,
                                headers: {
                                    "X-Authorization": sessionStorage.getItem("token"),
                                    "Content-Type": photo.type
                            }
                            }).then(function(response) {
                                alert("Photo successfully added")
                            }, function(error) {
                                alert("Photo file too large")
                            })
                    }
                    alert("Auction successfully added")
                    location.reload()
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getCurrentDate: function() {
            var d = new Date()
            var year = d.getFullYear()
            var month = d.getMonth().toString().length === 1 ? '0' + (d.getMonth() + 1).toString() : d.getMonth() + 1
            var date = d.getDate().toString().length === 1 ? '0' + (d.getDate()).toString() : d.getDate()
            var hours = d.getHours().toString().length === 1 ? '0' + d.getHours().toString() : d.getHours()
            var mins = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes().toString() : d.getMinutes()

            var output = year + '-' + month + '-' + date + 'T' + hours + ':' + mins
            return output
        },
        
        getCountVal: function() {
            var num = window.location.search.substring(window.location.search.indexOf("&count") + 7, window.location.search.indexOf("&count") + 9)
            var leftover = this.totalAuctions - ((this.pageNum - 1) * parseInt(num))
            if (false) {}
            if (leftover > num) {
                return "" + ((num * (this.pageNum - 1)) + 1) + "-" + (num * this.pageNum)
            } else {
                return "" + ((num * (this.pageNum - 1)) + 1) + "-" + ((num * (this.pageNum - 1)) + leftover)
            }
        },
        
        previewImage: function() {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(document.forms.auctionDetails.photo.files[0])

            fileReader.onload = function (oFREvent) {
                document.getElementById("imgPreview").src = oFREvent.target.result
            };
        },
        
        getTotalAuctions: function() {
            this.$http.get('http://localhost:4941/api/v1/auctions' + window.location.search.substring(0, window.location.search.indexOf("&count")))
                .then(function(response) {
                    this.totalAuctions = response.data.length
                    var num = window.location.search.substring(window.location.search.indexOf("&count") + 7, window.location.search.indexOf("&count") + 9)
                    this.pageTotal = Math.ceil(this.totalAuctions / parseInt(num))
                    if (window.location.search.indexOf("&startIndex") != -1) {
                        var skipped = window.location.search.substring(window.location.search.indexOf("&startIndex") + 12)
                        this.pageNum = (parseInt(skipped) / parseInt(num)) + 1
                    } else {
                        this.pageNum = 1
                    }
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getAuctions: function() {
            var str = 'http://localhost:4941/api/v1/auctions' + window.location.search
            if (window.location.search.indexOf("&count") == -1) {
                if (window.location.search.indexOf("?") == -1) {
                    str += '?count=25'
                } else {
                    str += '&count=25'
                }
            }
            this.$http.get(str)
                .then(function(response) {
                    this.auctions = response.data
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        pageHandler: function (diff) {
            var num = window.location.search.substring(window.location.search.indexOf("&count") + 7, window.location.search.indexOf("&count") + 9)
            var str = "&startIndex=" + ((this.pageNum + diff - 1) * parseInt(num))
            var searchStr = window.location.search.substring(window.location.search.indexOf("&startIndex"))
            if (window.location.search.indexOf("&startIndex") != -1) {
                searchStr = window.location.search.substring(0, window.location.search.indexOf("&startIndex"))
            }
            window.location = window.location.pathname + searchStr + str
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
        
        getImage: function(auctionId) {
            return "http://localhost:4941/api/v1/auctions/" + auctionId + "/photos" + "?token=" + Date.now()
        },
        
        auctionInfo: function(auctionId) {
            window.location='/auctions/' + auctionId
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