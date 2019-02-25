(function(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(function(pstn){
            $("#lat").val(pstn.coords.latitude);
            $("#lng").val(pstn.coords.longitude);
            $.get("https://maps.googleapis.com/maps/api/geocode/json?latlng="+pstn.coords.latitude+","+pstn.coords.longitude+"&key=AIzaSyCu4sHvhI9ahOjY79PwhfDqmmophtJaYtM", function(data){
                $("#loc").val(data.results[0].formatted_address);
            });
        });
    }else{
        console.log("Geolocation is not supported.");
    };
}());