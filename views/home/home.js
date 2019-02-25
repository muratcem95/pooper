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

// data-* attributes to scan when populating modal values
var ATTRIBUTES = ['username', 'comment', 'poop'];

$('[data-toggle="modal"]').on('click', function (e) {
    // convert target (e.g. the button) to jquery object
    var $target = $(e.target);
    // modal targeted by the button
    var modalSelector = $target.data('target');
  
    // iterate over each possible data-* attribute
    ATTRIBUTES.forEach(function (attributeName) {
        // retrieve the dom element corresponding to current attribute
        var $modalAttribute = $(modalSelector + ' #modal-' + attributeName);
        var dataValue = $target.data(attributeName);
    
        // if the attribute value is empty, $target.data() will return undefined.
        // In JS boolean expressions return operands and are not coerced into
        // booleans. That way is dataValue is undefined, the left part of the following
        // Boolean expression evaluate to false and the empty string will be returned
        $modalAttribute.text(dataValue || '');
    });
});