/**
 * Created by Iceblaze on 20. 5. 2016.
 */
$.ajax({
    datatype: "json", // expecting JSON to be returned

    success: function (result) {
        console.log(result);
        if(result.status == 200){
            self.isEditMode(!self.isEditMode());
        }
    },
    error: function(result){
        console.log(result);
    }
});