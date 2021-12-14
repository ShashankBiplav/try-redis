import express from "express";
import nodeFetch from "node-fetch";
import Redis from "ioredis";
import JSONCache from "redis-json";

const PORT = process.env.PORT || 3000;

const redis = new Redis();

const jsonCache = new JSONCache(redis);

const app= express();


//make request to github to get userData
 const getRepos = async(req, res, next) => {
  try {
    console.log('Fetching Data...');
    const {username} = req.params;
    
    const response = await nodeFetch(`https://api.github.com/users/${username}`);
    const data = await response.json();

    //Set the data into Redis
    // client.set(username, 3600, JSON.stringify({...data}));

    await jsonCache.set(username, data);

    // res.send(setResponse(username, {...data}));

    res.status(200).json({...data});
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Some Error Occured!",
    });
  }
 };

 //cache middleware
 const cache = async(req, res, next) => {
   const {username} = req.params;
    try {
      const data = await jsonCache.get(username);
      if (data) {
        return res.status(200).json({...data});
      }
      next();
    } catch (error) {
      throw(error);
    }
 };

app.get('/repos/:username',cache, getRepos);

app.listen(PORT, ()=> {
  console.log(`Listening on port : ${PORT}`);
});