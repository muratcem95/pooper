const socket=io();
socket.on('connect',function(){
    console.log('Connected to server.');
});
socket.on('disconnect',function(){
    console.log('Disconnected from server.');
});
$(document).ready(function(){
    bsCustomFileInput.init();
});
$(function(){
    $('[data-toggle="tooltip"]').tooltip()
});
function chkCase(elem){
    var temp=elem.value;
    elem.value=temp.toLowerCase();
};
$("#newPp").submit(function(e){
    $("#addPp").css("display", "none");
    window.setTimeout(function(){
        window.location.href="/home";
    },5000);
});
var ATTRIBUTES=['dsc','cmntr','cmnt'];
$('[data-toggle="modal"]').on('click',function(e){
    var $target=$(e.target);
    var modalSelector=$target.data('target');
    ATTRIBUTES.forEach(function(attributeName){
        var $modalAttribute=$(modalSelector+'#modal-'+attributeName);
        var dataValue=$target.data(attributeName);
        $modalAttribute.text(dataValue||'');
    });
});