/**
 * Created by Iceblaze on 28. 5. 2016.
 */
$(function() {
    $(".visibleContent").show();

    $(".tabs li:not(:last-child) a").on('click',function(event) {
        var element = $(this);

        $(".selectedTab").removeClass("selectedTab");
        element.addClass("selectedTab");

        var contentId = element.attr('id');

        $(".visibleContent").hide().removeClass("visibleContent");
        $("#" + contentId + "Content").show().addClass("visibleContent");

        socket.emit("dataRequest", { content: contentId });

        socket.on('responseData', function(data) {
            if(data.content == "accounts"){
                updateAccounts(data.data);
            } else if(data.content == "transactions"){
                updateTransactions(data.data);
            } else if(data.content == "loans"){
                updateLoans(data.data);
            } else if(data.content == "cards"){
                updateCards(data.data);
            }
        });
    });

    $("#accountSelector").on('change', function (event) {
        socket.emit("transactionDataRequest", { accountId: this.value });

        socket.on('transactionData', function(data) {
            var table = "<tr><th>Transaction Date</th><th>Amount</th></tr>";
            for(var i = 0; i < data.length; i++){
                table += "<tr><td>" + data[i].transDate + "</td><td " + (data[i].value < 0 ? "class='negativeAmount'" : "") + " >" + data[i].value + "</td></tr>";
            }
            $("#transactionsContent").find(".contentWrapper table").html(table);
        });
    });

    $(".newTransactionButton").on('click',function(event) {
        $(".selectedTab").removeClass("selectedTab");

        $(".visibleContent").hide().removeClass("visibleContent");
        $("#paymentScreen").show().addClass("visibleContent");
    });

    $("#payment").on('submit',function(event) {
        event.preventDefault();

        var paymentAccountSelect = $("#paymentAccountSelect");
        var recipientAccount = $("#recipientAccount");
        var paymentAmount = $("#paymentAmount");

        socket.emit("transactionRequest", { accountId: paymentAccountSelect.val(), recipientAccount: recipientAccount.val(), paymentAmount: paymentAmount.val() });

        paymentAccountSelect.val("");
        recipientAccount.val("");
        paymentAmount.val("");

        $(".visibleContent").hide().removeClass("visibleContent");
        $("#messageScreen").show().addClass("visibleContent");

        setTimeout(function () {
            $("#home").addClass("selectedTab");
            $(".visibleContent").hide().removeClass("visibleContent");
            $("#homeContent").show().addClass("visibleContent");
        }, 5000);
    });

});

function updateAccounts(data) {
    var table = "<tr><th>Account Number</th><th>Balance</th><th>Transactions</th></tr>";
    for(var i = 0; i < data.length; i++){
        table += "<tr><td>" + generateAccountNumber(data[i].accountID) + "</td><td>" + data[i].balance + "</td><td>Check transactions</td></tr>";
    }
    $("#accountsContent").find(".contentWrapper table").html(table);
}

function updateTransactions(data) {
    var options = "<option value='-1' disabled selected>Select account</option>";
    for(var i = 0; i < data.length; i++){
        options += "<option value='" + data[i].accountID + "'>" + generateAccountNumber(data[i].accountID) + " - " + data[i].balance + "</option>";
    }
    $("#accountSelector").html(options);
    $("#paymentAccountSelect").html(options);
    $("#transactionsContent").find(".contentWrapper table").html("");
}

function updateLoans(data) {
    var table = "<tr><th>Lent amount</th><th>Paid amount</th><th>Interest</th></tr>";
    for(var i = 0; i < data.length; i++){
        table += "<tr><td>" + data[i].amount + "</td><td>" + data[i].paidAmount + "</td><td>" + data[i].interest + "%</td></tr>";
    }
    $("#loansContent").find("table").html(table);
}

function updateCards(data) {
    var table = "<tr><th>Card</th><th>Account</th><th>Status</th></tr>";
    for(var i = 0; i < data.length; i++){
        table += "<tr><td>" + generateCardNumber(data[i].cardID) + "</td><td>" + generateAccountNumber(data[i].accountID) + "</td><td>" + (data[i].active == 0 ? "deactivated" : "active") + "</td></tr>";
    }
    $("#cardsContent").find("table").html(table);
}

function generateAccountNumber(accountID) {
    return ("000000000" + accountID).slice(-10) + "/0500";
}

function generateCardNumber(cardID) {
    return ("0000 0000 0000 000" + cardID).slice(-19);
}