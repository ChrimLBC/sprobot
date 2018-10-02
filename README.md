# sprobot

Sprobot is currently a discord Bot with the purpose of retrieving runs that need verified and runs that were recently verified for all games for the Spyro series. This bot uses the www.speedrun.com/api for retrieving information.  

The following env variables need to be included:  

REACT_APP_API_LINK=http://localhost:8080  
REACT_APP_WS_LINK=:/localhost:8081  
REACT_APP_DISCORD_TOKEN=YOUR DISCORD BOT TOKEN  

Replace the variables with the proper links for the API and websocket and the discord bot token.  

TODO:  

Remove hard coding and add commands for the following:  

-Set Guild/Server where the bot will post the verified runs/runs to verify  
-Set channel where the bot will post the verified runs/runs to verify  
-Add/Remove commands for adding and removing games to the list of games  
-Set specific channel for bot to listen to message commands  


-Decide on method of storing these customizable features (Database or Firebase?)  
-Make UI look good and add the customazible features to the UI as well  
-Add more information about the bot to the UI (last ran at X, last command executed, status of last command, etc)  
-Add Authentication (Firebase) and make api more secure with access tokens  




