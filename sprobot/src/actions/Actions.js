import * as types from './constants/ActionTypes'

export const updateSprobot = (status, uptime) => ({
    type: types.UPDATE_SPROBOT,
    status,
    uptime
})