// /../pages/api/root.ts

import create_user from './routers/create-user'
import ProfileAPI from './routers/account'
import AddPointsAPI from './routers/add-points'
//import esp_req_token from './routers/esp-request-token'
import { generateToken } from './routers/generateToken'
import GetHistoryAPI from './routers/get-history'
import GetPointsAPI from './routers/get-points'
import RedeemAPI from './routers/redeem'
import pointADD from './routers/pointADD'
import RedemptionsAPI from './routers/redemptions'
import RewardAPI from './routers/rewards'
import update_data from './routers/update'
import userData from './routers/user'
import up_reward_img from './routers/upload-reward-image'
import validate_token from './routers/validate-token'

export const appRouter = () => ({
    createUser: create_user,
    proFileAPI: ProfileAPI,
    addpoints: AddPointsAPI,
    //esp_req_token,
    generateToken,
    getHisAPI: GetHistoryAPI,
    getPointAPI: GetPointsAPI,
    RedeemAPI,
    pointADD,
    RedemptionsAPI,
    RewardAPI,
    update_data,
    userData,
    up_reward_img,
    validateToken: validate_token,
});

export type AppRouter = typeof appRouter;