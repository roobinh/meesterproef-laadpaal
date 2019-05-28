# meesterproef-laadpaal
_De eindopdracht voor de cmda-minor-web-development-1819_

## Installation: MongoDB

Step 1: Download MongoDB server [here](https://www.mongodb.com/download-center/community)

Step 2: Run and install MongoDB

Step 3: Command prompt ->

```
mongod --dbpath [your-directory-here]\meesterproef-laadpaal\laadpaal\data
```


## Insert new table/row
Step 1: Run MongoDB, open new command prompt and run:

```
mongod
```
_This will be your shell_

Step 2: To insert a table, use the following commands in the shell ->

```
use klachtendb
```
```
 db.users.insert([{"email":"roobin1999@gmail.com", "voornaam":"robin","telefoonnummer":"0648372388","punten":"71"}])
 ```
To find data ->
```
db.users.find().pretty();
```
