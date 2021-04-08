module.exports.now = function() {
    const today = new Date();
    return today.getTime();
}

module.exports.tomorrow = function() {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const str = mm + '/' + dd + '/' + yyyy;
    return str;
}

module.exports.afterWeek = function() {
    const today = new Date();
    today.setDate(today.getDate() + 7);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const str = mm + '/' + dd + '/' + yyyy;
    return str;
}

module.exports.afterMonth = function() {
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const str = mm + '/' + dd + '/' + yyyy;
    return str;
}

module.exports.afterYear = function() {
    const today = new Date();
    today.setFullYear(today.getFullYear() + 1);
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    const str = mm + '/' + dd + '/' + yyyy;
    return str;
}

