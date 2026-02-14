1. make it possible to customize the descriptions & add new photos.
2. passkey auth (max 2 users, max 3 passkeys per user) - HARDLOCKED usernames: 
 i) adas  
 ii) roksanka
 - registering a passkey REQUIRES A KEY (env var - same for both users) 
3. keep track of WHO added WHAT and WHEN (display it next to the photo)
4. create api routes for programatic adding (require: username, key[the one from env var], file[the photo]. optional: date[default=time_of_upload], description[default='<3'].)

