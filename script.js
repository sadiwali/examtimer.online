$(document).ready(() => {

    // allow only numbers
    $(".number").on('keypress', (key) => {
        if(key.charCode < 48 || key.charCode > 57) return false;
    })
    // prevent overflow
    $(".number").on('blur', (e) => {
       if (e.currentTarget.value > e.currentTarget.max) e.currentTarget.value = e.currentTarget.max; 
    });
    // prevent more than 2 digits
    $(".number").on('input', (e) => {
        console.log(e);
       if (e.currentTarget.value.length > e.currentTarget.maxLength) e.currentTarget.value = e.currentTarget.value.slice(0, e.currentTarget.maxLength); 
    });
    
    

});
