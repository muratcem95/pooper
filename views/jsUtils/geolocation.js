(function() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            console.log(position);
            
            $("#latitude").val(position.coords.latitude);
            $("#longitude").val(position.coords.longitude);
            
            $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+position.coords.latitude+","+position.coords.longitude+"&key=AIzaSyCu4sHvhI9ahOjY79PwhfDqmmophtJaYtM", function(data) {
                $("#location").val(data.results[0].formatted_address);
            });
            
//            var img = new Image();
//            img.src = "https://maps.googleapis.com/maps/api/staticmap?center="+position.coords.latitude + "," + position.coords.longitude + "&zoom=13&size=800x400&sensor=false";
////            $("#output").html(img);
        });
    } else {
        console.log("Geolocation is not supported.");
    };
}());