/**
 * Created by Iceblaze on 19. 5. 2016.
 */
module.exports = function(clientID, firstName, lastName, dob, archived, email, phone, username, active){
    return {
        clientID: clientID,
        firstName: firstName,
        lastName: lastName,
        dob: dob,
        archived: archived,
        email: email,
        phone: phone,
        username: username,
        active: active,

        getClientId: function() {
            return clientID;
        },
        getFullName: function() {
            return firstName + " " + lastName;            
        }
    };
};