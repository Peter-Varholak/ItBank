/**
 * Created by Iceblaze on 28. 5. 2016.
 */
$(function() {
    $(".tester").on('click',function() {
        event.preventDefault();
        alert("boo");
        console.log("bla");
    });
});