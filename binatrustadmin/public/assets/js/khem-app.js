
const sendUpdateRequest = function(eleId, trxId, userId, loc) {
    const checked = $("#"+eleId).is(":checked")
    const data = {status: checked ? "active":"pending", trxId, userId}

    return $.ajax({
        url: "/transactions",
        type: "PUT",
        data,
        beforeSend: () => {

        },
        success: ( res ) => {
            window.location.replace(loc)
        },
        error: ( err ) => {

        }
    })
}

const updateProfit = function(userId, what, loc) {
    const data = {userId, what};
    return $.ajax({
        url: "/transactions",
        type: "PUT",
        data,
        beforeSend: () => {

        },
        success: ( res ) => {
            window.location.replace(loc)
        },
        error: ( err ) => {

        }
    })
}

const removeUser = function(userId, loc) {
    const data = {userId};
    return $.ajax({
        url: "/users/delete",
        type: "DELETE",
        data,
        beforeSend: () => {

        },
        success: ( res ) => {
            window.location.replace(loc)
        },
        error: ( err ) => {

        }
    })
}