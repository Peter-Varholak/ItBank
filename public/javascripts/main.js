/**
 * Created by Iceblaze on 28. 5. 2016.
 */
$(function() {
    $(".visibleContent").show();

    $(".tabs li:not(:last-child) a").on('click',function(event) {
        var element = $(this);

        $(".selectedTab").removeClass("selectedTab");
        element.addClass("selectedTab");

        var contentName = element.attr('id') + "Content";
        $(".visibleContent").hide().removeClass("visibleContent");
        $("#" + contentName).show().addClass("visibleContent");
    });


});