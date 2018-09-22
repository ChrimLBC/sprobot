import { combineReducers } from "redux"
import * as types from './actions/constants/ActionTypes'
import { parseStatus } from './utils/parser'

const discord = (state = [], action) => {
    console.log(action);
    switch (action.type) {
        case types.UPDATE_SPROBOT:
            return {
                ...state, 
                status: parseStatus(action.status),
                uptime: action.uptime
            }
        default:
            return state
    }
}

const sprobotReducer = combineReducers({
    discord
})

export default sprobotReducer