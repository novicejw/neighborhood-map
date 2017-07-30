// Model: Markers that will be shown to the user.
var locations = [
    {
        title: 'Metropolitan Museum of Art',
        location: {lat: 40.779437, lng: -73.963244},
        foursquareID: '427c0500f964a52097211fe3'
    },
    {
        title: 'Museum of Modern Art',
        location: {lat: 40.761433, lng: -73.977622},
        foursquareID: '4af5a46af964a520b5fa21e3'
    },
    {
        title: 'American Museum of Natural History',
        location: {lat: 40.781324, lng: -73.973988},
        foursquareID: '4297b480f964a52062241fe3'
    },
    {
        title: 'Whitney Museum of American Art',
        location: {lat: 40.739588, lng: -74.008863},
        foursquareID: '421a7600f964a5209d1f1fe3'
    },
    {
        title: 'The Frick Collection',
        location: {lat: 40.770970, lng: -73.967384},
        foursquareID: '49d6de35f964a520085d1fe3'
    },
    {
        title: 'The Met Breuer',
        location: {lat: 40.773420, lng: -73.963805},
        foursquareID: '560697f6498e0ef447c5f6fd'
    },
    {
        title: 'The Intrepid Sea, Air & Space Museum',
        location: {lat: 40.764527, lng: -73.999608},
        foursquareID: '49f5135cf964a5208e6b1fe3'
    },
    {
        title: 'Solomon R Guggenheim Museum',
        location: {lat: 40.782980, lng: -73.958971},
        foursquareID: '41706480f964a520a51d1fe3'
    },
    {
        title: 'Rubin Museum of Art',
        location: {lat: 40.740177, lng: -73.997814},
        foursquareID: '47b6cfccf964a520af4d1fe3'
    },
    {
        title: 'The Morgan Library & Museum',
        location: {lat: 40.749226, lng: -73.981397},
        foursquareID: '49c54c1bf964a520ed561fe3'
    }
];

// Create map
var map;
// Create a new blank array for all the listing markers.
var markers = [];

// View
var Listing = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

// ViewModel
var ViewModel = function() {
    // Since 'this' changes in every scope, 'self' will preserve 'this' value throughout viewModel.
    var self = this;

    this.listings = ko.observableArray(locations);

    // when user clicks on a listing, show the marker and infowindow associated with the listing
    this.setLocation = function(clickedListing) {
        google.maps.event.trigger(clickedListing.marker, 'click');
        clickedListing.marker.setVisible(true);
    };

    this.query = ko.observable('');

    this.filterListings = ko.computed(function() {
        for (var i = 0; i < markers.length; i++) {
            markers[i].setVisible(true);
        }
        var search = self.query().toLowerCase();
        return ko.utils.arrayFilter(locations, function(listing) {
            if (listing.title.toLowerCase().indexOf(search) >= 0) {
                return true;
            }
            listing.marker.setVisible(false);
        });
    });
}

ko.applyBindings(new ViewModel());


// Initialize map, markers and infowindows

function initMap() {
// Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7413549, lng: -73.9980244},
        zoom: 13,
        mapTypeControl: false
    });

    var bounds = new google.maps.LatLngBounds();

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        createMarker(locations[i]);
    }

    function createMarker(location) {
        // Get the position from the location array.
        var position = location.location;
        var title = location.title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            //id: i
        });
        // store marker into locations array
        location.marker = marker;
        // show marker
        marker.setVisible(true);
        // extend bounds of map to show marker
        bounds.extend(marker.position);
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create infowindow - only one open at each time
        var infowindow = new google.maps.InfoWindow();
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            foursquareAPI(location, infowindow);
//            populateInfoWindow(this, largeInfowindow);
        });

    }

    map.fitBounds(bounds);

}


// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.

function foursquareAPI(location, infowindow) {

    // Construct Foursquare URL
    var foursquareURL = "https://api.foursquare.com/v2/venues/";
    foursquareURL += location.foursquareID + '?' + $.param({
      'client_id': 'RMNFGQ3TJCV2IV3OSKWL3NM3ZVMAPRVO1RIEJRSQXIE1MLKZ',
      'client_secret': 'C5L5FCPPTQGJFKW4CJSIQXFK2MIYIPUJZ53RGEH0Y5CG2LJF',
      'v': '20170730'
    });

    // Call API and construct HTML for infowindow
    $.ajax({
        dataType: "jsonp",
        url: foursquareURL,
        success: function(data) {
            var innerHTML = '<div>';
            if (data.response.venue.name) {
                innerHTML += '<strong>' + data.response.venue.name + '</strong>';
                innerHTML += '<br>';
                innerHTML += '<p>' + data.response.venue.contact.phone + '</p>';
                innerHTML += '<br>';
                innerHTML += '<p>' + data.response.venue.stats.checkinsCount + '</p>';
            }
            innerHTML += '</div>';

            // Set the marker property on this infowindow so it isn't created again.
            infowindow.marker = location.marker;
            infowindow.setContent(innerHTML);
            infowindow.open(map, location.marker);
            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                infowindow.marker = null;
            });
        }
    })
}

function populateInfoWindow(marker, infowindow) {
// Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        infowindow.marker = marker;

        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function() {
            infowindow.marker = null;
        });
    }
}