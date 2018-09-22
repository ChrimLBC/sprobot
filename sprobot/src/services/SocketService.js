import ReconnectingWebSocket from 'reconnecting-websocket';
import * as types from '../actions/constants/ActionTypes'
let _socket = null;
let _status = null;
let _store = null;

const receiveSocketMessage = (store, action) => {
    switch (action.type) {
        case types.UPDATE_SPROBOT:
        default:
            return store.dispatch(action);
    }
}

export const SocketService = {

    getStatus: () => {
        return _status;
    },

    connect: () => {
        const scheme = 'ws';
        const url = `${scheme}://localhost:8081/`;
        _socket = new ReconnectingWebSocket(url, ['sprobot'], {debug: true, reconnectInterval: 1000});
    },

    getStore: () => {
        return _store
    },
    setStore: (store) => {
        _store = store
    },

    listen: (store) => {
        console.log("got here listen")
        _socket.onmessage = (event) => {
            console.log("on message triggered");
            const data = JSON.parse(event.data);
            console.log("got to onmessage in listen with : ", data);
            receiveSocketMessage(store, data);
        }

        // socket.addEventListener('changed', (response) => {
        //     console.log(response, " on changed");
        //     socket.send(response);
        // });
    },
    
    send: (action) => {
        if(_socket.readyState ===1){
            _socket.send(JSON.stringify(action));
        };
    }
}