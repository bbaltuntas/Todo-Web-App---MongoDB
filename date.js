module.exports.getDate = function () {
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long"
    }
    const todayDate = new Date()
    return todayDate.toLocaleDateString('en-us', options)
}