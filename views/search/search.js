console.log(moment().format('MMMM Do YYYY'));

$(function () {
    $('[data-toggle="tooltip"]').tooltip()
});  

$(document).ready(function () {
    bsCustomFileInput.init();
});

function chkCase(elem) {
    var temp = elem.value;
    elem.value = temp.toLowerCase();
};