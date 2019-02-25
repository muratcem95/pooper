$(function () {
    $('[data-toggle="tooltip"]').tooltip()
}); 
function chkCase(elem) {
    var temp = elem.value;
    elem.value = temp.toLowerCase();
};