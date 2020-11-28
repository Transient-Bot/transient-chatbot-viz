# transient-chatbot-viz
Frontend and visualization component of the transient behavior bot.

https://transient-bot.github.io/transient-chatbot-viz/

# Setup
1. Change constant ```baseUrl``` in ./javascript/config.js to the url of the backend service.
2. Change constant ```socketUrl``` in ./javascript/config.js to the url of the websocket of the backend service.
3. Host site on webserver
    
    For example: ```python -m http.server```

### Remark about the Dialogflow Messenger
You will have to replace the agent-id attribute of the dialogflow messenger element in ```index.html``` with the id of your agent.
