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
        
        <div id="info">
            <a @click="auctionsLink()" v-if="!notFound"> Auctions </a> <p v-if="!notFound"> > </p> <a @click="categoryLink(auction.categoryId)"> {{ auction.categoryTitle.charAt(0).toUpperCase() + auction.categoryTitle.slice(1) }} </a> 
            <input type="button" id="backButton" value=" ← Back  " onclick="window.history.back()">
            <h1 id="auctionTitle" v-if="notFound"> 404: Auction not found </h1>
            <h1 id="auctionTitle"> {{ auction.title }} </h1>
            <div id="imgHolder" v-if="!notFound">
                <img :src="getImage()">
            </div>
            
            <div id="sideInfo" v-if="!notFound">
                <input type="button" v-if="ownAuction" id="editButton" value="Edit auction" data-toggle="modal" data-target="#editAuctionModal">
                <input type="button" v-if="ownAuction" id="deleteButton" value="Delete photo" @click="deletePhoto()">
                <p id="auctionEndDate"> {{ convertDate(auction.startDateTime, 1) }} </p>
                <p id="auctionEndDate"> {{ convertDate(auction.endDateTime, 2) }} </p>
                
                <p id="reserveAmount" v-if="this.auction.currentBid > this.auction.reservePrice"> Reserve met </p>
                <p id="bidTitle"> {{ checkBidStart() }} </p> 
                <p id="bidAmount" v-if="this.auction.bids.length > 0"> ${{ auction.currentBid }} </p> 
                <p id="bidAmount" v-if="this.auction.bids.length == 0"> ${{ auction.startingBid }} </p>
                <input type="text" id="bidInput" :value="getCurrentBid()" v-if="!auctionEnded()">
                <input type="button" id="bidButton" value=" Place Bid " @click="placeBid()" v-if="!auctionEnded()">
                <p id="bidHistoryTitle"> Bid history: </p>
                <ul id="bidList">
                    <li v-for="bid in auction.bids" @click="goToProfile(bid.buyerId)"> <p> {{ bid.buyerUsername }}: ${{bid.amount}} </p> <p> {{ convertDate(bid.datetime, 3) }} </p></li>
                </ul>
            </div>
            
            <div id="mainInfo" v-if="!notFound">
                <h1> Description </h1>
                <p> {{ auction.description }} </p>
                <br>
                <p @click="goToProfile(auction.seller.id)"> Seller: {{ auction.seller.username }} </p>
            </div>
            
        </div>
        
        <div v-if="errorFlag" style="color: red;">
            {{ error }}
        </div>
        
        <div class="modal fade" id="editAuctionModal" tabindex="-1" role="dialog"aria-labelledby="editAuctionModalLabel" aria-hidden="true">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="editAuctionModalLabel"> Edit Auction </h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <form name="auctionDetails">
                        
                            <div id="leftSide">
                                <h1> Auction details: </h1>
                                <p> Title: <input type="text" name="title" :placeholder="auction.title"> </p>
                                <p> Category:
                                    <select name="category">
                                        <option value="1"> Apparel </option>
                                        <option value="2"> Equipment </option>
                                        <option value="3"> Vehicles </option>    
                                        <option value="4"> Property </option>
                                        <option value="5"> Other </option>
                                    </select>
                                </p>
                                <p> Start date: <input type="datetime-local" :value="getDate(auction.startDateTime)" name="startDate"> </p>
                                <p> End date: <input type="datetime-local" :value="getDate(auction.endDateTime)" name="endDate"> </p>
                                <p> Starting Bid: <input type="text" name="startingBid" :placeholder="auction.startingBid"> </p>
                                <p> Reserve Price: <input type="text" name="reservePrice" :placeholder="auction.reservePrice"> </p>
                                <p> Description: </p>
                                <textarea name="description" :placeholder="auction.description"> </textarea> 
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
                        <input type="button" id="submitAuction" @click="editAuction()" value="Confirm">
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
            loggedIn: false,
            username: "",
            ownAuction: false,
            notFound: false,
            auction: {
                "categoryTitle": "",
                "bids": [],
                "seller": {
                    "username": ""
                }
            }
        }
    },
    mounted: function() {
        this.getAuction()
        this.checkLoggedIn()
        this.linkColours()
    },
    methods: {
        getAuction: function() {
            var pathname = window.location.pathname
            var id = pathname.substr(pathname.lastIndexOf("/") + 1, pathname.length)
            this.$http.get('http://localhost:4941/api/v1/auctions/' + id)
                .then(function(response) {
                    this.auction = response.data
                    this.auction.bids.reverse()
                    if (this.auction.seller.id == sessionStorage.getItem("id")) {
                        this.ownAuction = true;
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
        
        previewImage: function() {
            var fileReader = new FileReader();
            fileReader.readAsDataURL(document.forms.auctionDetails.photo.files[0])

            fileReader.onload = function (oFREvent) {
                document.getElementById("imgPreview").src = oFREvent.target.result
            };
        },
        
        deletePhoto: function(dontReload) {
            var id = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1)
            this.$http.delete('http://localhost:4941/api/v1/auctions/' + id + '/photos',
                    {
                        headers: {
                            'X-Authorization': sessionStorage.getItem("token")
                        }
                    }
                )
                .then(function(response) {
                    alert("Successfully deleted photo")
                    if (!dontReload) {
                        location.reload()
                    }
                }, function(error) {
                    alert("No photo to delete")
                })          
        },
        
        editAuction: function() {
            var form = document.forms.auctionDetails
            var start = new Date(form.startDate.value).getTime()
            var end = new Date(form.endDate.value).getTime()
            var now = new Date().getTime()
            if (now >= new Date(this.auction.startDateTime).getTime()) {
                alert("You cannot edit an auction after it has already started")
                return
            } 
            if (!form.title.value && !form.startingBid.value && !form.reservePrice.value && form.photo.files.length == 0 && start == this.auction.startDateTime && end == this.auction.endDateTime && !form.description.value && form.category.value == this.auction.categoryId) {
                alert ("At least one field is required to edit auction")
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
            var data = {}
            if (form.title.value.length > 0 && form.title.value != this.auction.title) { data.title = form.title.value }
            if (form.category.value != this.auction.categoryId ) { data.categoryId = parseInt(form.category.value) }
            if (start != this.auction.startDateTime) { data.startDateTime = start }
            if (end != this.auction.endDateTime) { data.endDateTime = end }
            if (form.description.value.length > 0 && form.description.value != this.auction.description) { data.description = form.description.value }
            if (form.startingBid.value.length > 0 && parseInt(form.startingBid.value) != parseInt(this.auction.startingBid)) { data.startingBid = parseInt(form.startingBid.value) }
            if (form.reservePrice.value.length > 0 && parseInt(form.reservePrice.value) == parseInt(this.auction.reservePrice)) { data.reservePrice = parseInt(form.reservePrice.value) }
            var id = window.location.pathname.substr(window.location.pathname.lastIndexOf("/") + 1)
            
            if (document.forms.auctionDetails.photo.files.length != 0) {
                var photo = document.forms.auctionDetails.photo.files[0]
                this.$http.post('http://localhost:4941/api/v1/auctions/' + id + '/photos' , photo,
                        {
                            emulateJSON: false,
                            headers: {
                                'X-Authorization': sessionStorage.getItem("token"),
                                "Content-Type": photo.type
                            }
                        }
                    )
                    .then(function(response) {
                        if (Object.keys(data).length > 0) {
                            this.$http.patch('http://localhost:4941/api/v1/auctions/' + id, data,
                                    {
                                        emulateJSON: false,
                                        headers: {
                                            'X-Authorization': sessionStorage.getItem("token")
                                        }
                                    }
                                )
                                .then(function(response) {
                                    alert("Successfully edited auction")
                                    location.reload()
                                }, function(error) {
                                    this.error = error
                                    this.errorFlag = true
                                })
                        }
                        alert("Successfully added photo")
                        if (Object.keys(data).length == 0) {
                            location.reload()
                        }
                    }, function(error) {
                        this.error = error
                        this.errorFlag = true
                    })        
            } else if (Object.keys(data).length > 0) {
                this.$http.patch('http://localhost:4941/api/v1/auctions/' + id, data,
                        {
                            emulateJSON: false,
                            headers: {
                                'X-Authorization': sessionStorage.getItem("token")
                            }
                        }
                    )
                    .then(function(response) {
                        alert("Successfully edited auction")
                        location.reload()
                    }, function(error) {
                        this.error = error
                        this.errorFlag = true
                    })
            } else {
                alert ("At least one field must be different to edit auction")
            }
            
            
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
        
        getDate(dateTime) {
            var d = new Date(dateTime)
            var year = d.getFullYear()
            var month = d.getMonth().toString().length === 1 ? '0' + (d.getMonth() + 1).toString() : d.getMonth() + 1
            var date = d.getDate().toString().length === 1 ? '0' + (d.getDate()).toString() : d.getDate()
            var hours = d.getHours().toString().length === 1 ? '0' + d.getHours().toString() : d.getHours()
            var mins = d.getMinutes().toString().length === 1 ? '0' + d.getMinutes().toString() : d.getMinutes()

            var output = year + '-' + month + '-' + date + 'T' + hours + ':' + mins
            return output
        },

        checkBidStart: function() {
            if (this.auction.bids.length > 0){
                return "Current bid:"
            } else {
                return "Start price:"
            }
        },
        
        auctionEnded: function() {
            var start = new Date(this.auction.startDateTime)
            var end = new Date(this.auction.endDateTime)
            if (new Date().getTime() - end.getTime() > 0) {
                return true
            } else if (new Date().getTime() - start.getTime() < 0) {
                return true
            }
        },
        
        placeBid: function() {
            var amount = document.getElementById("bidInput").value
            if (!this.loggedIn) {
                alert("Must be logged in to bid")
                return
            }
            if (this.auction.bids[0].buyerId == sessionStorage.getItem("id")) {
                alert("You cannot bid consecutively")
                return
            }
            if (amount[0] == "$") {
                amount = amount.substr(1)
            }
            if (isNaN(amount)) {
                alert("Bid amount must be a number")
                document.getElementById("bidInput").value = this.getCurrentBid()
                return
            }
            if (this.auction.seller.id == sessionStorage.getItem("id")) {
                alert("Cannot bid on your own auction")
                return
            }
            if (parseInt(amount) <= parseInt(this.auction.startingBid)) {
                alert ("Bid must be at least $1 greater than the starting price")
                document.getElementById("bidInput").value = this.getCurrentBid()
                return
            } else if (parseInt(amount) < parseInt(this.auction.currentBid) + 1) {
                alert ("Bid must be at least $1 greater than the current bid")
                document.getElementById("bidInput").value = this.getCurrentBid()
                return
            }
            var pathname = window.location.pathname
            var id = pathname.substr(pathname.lastIndexOf("/") + 1, pathname.length)
            this.$http.post('http://localhost:4941/api/v1/auctions/' + id + '/bids?amount=' + parseInt(amount), {},
                {
                    headers: {
                        'X-Authorization': sessionStorage.getItem("token")
                    }
                })
                .then(function(response) {
                    alert("Successfully placed bid")
                    location.reload()
                }, function(error) {
                    this.error = error
                    this.errorFlag = true
                })
        },
        
        getCurrentBid: function(plusOne) {
            if (this.auction.currentBid > this.auction.startingBid) {
                return "$" + (this.auction.currentBid + 1)
            } else {
                return "$" + (this.auction.startingBid + 1)
            }
        },
        
        getImage: function() {
            var pathname = window.location.pathname
            var id = pathname.substr(pathname.lastIndexOf("/") + 1, pathname.length)
            return "http://localhost:4941/api/v1/auctions/" + id + "/photos" + "?token=" + Date.now()
        },
        
        auctionsLink: function() {
            window.location='/auctions?q=&count=25'
        },
        
        categoryLink: function(categoryId) {
            window.location='/auctions?category-id=' + categoryId + '&count=25'
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