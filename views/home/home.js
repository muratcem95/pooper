console.log(moment().format('MMMM Do YYYY'));

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});  

$(document).ready(function () {
    bsCustomFileInput.init();
});

$("#newPoopForm").submit(function(e) {
    $("#addNewPoop").css("display", "none");
    
    window.setTimeout(function(){
        window.location.href = "/home";
    }, 5000);
});

function chkCase(elem) {
    var temp = elem.value;
    elem.value = temp.toLowerCase();
};