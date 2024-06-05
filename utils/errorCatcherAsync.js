module.exports = (errorCatcherAsync) => (req, res, next) => {
    Promise.resolve(errorCatcherAsync(req, res, next).catch(next))
} 