import homeRouter from './home.js'
import newsRouter from './news.js';
import searchRouter from './search.js'
import userRouter from './user.js'

function route(app) {
    app.use('/', homeRouter)
    app.use('/news', newsRouter)
    app.use('/search', searchRouter)
    app.use('/users', userRouter)
}

export default route