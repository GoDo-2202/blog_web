import homeRouter from './home.js'
import newsRouter from './news.js';
import searchRouter from './search.js'
import userRouter from './user.js'
import authRouter from './auth.js'
import { API_PATH } from "../app/constants/apiPaths.js";

function route(app) {
    app.use(API_PATH.AUTH, authRouter);
    app.use(API_PATH.HOME, homeRouter);
    app.use(API_PATH.NEWS, newsRouter);
    app.use(API_PATH.SEARCH, searchRouter);
    app.use(API_PATH.USERS, userRouter);
}

export default route