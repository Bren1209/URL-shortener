const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortId = require('shortid');
const { urlencoded } = require('body-parser');

require('dotenv').config()

const app = express();
const baseURL = 'https://cimso.xyz/'

app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', __dirname + '/views');

mongoose.connect('mongodb://localhost:27017/url-shortener', { useNewUrlParser: true, useUnifiedTopology: true });

const shorteningSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String
})

const Url = new mongoose.model('Url', shorteningSchema)

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/database', (req, res) => {
  Url.find({}, (err, foundItems) => {
    if(err){
      console.log(err)
    } else {
      res.render('database', {foundItems: foundItems})
    }
  })
})

app.post('/shortened-url', (req, res) => {
  const inputURL = req.body.ogurl.trim();
  const shortCode = shortId.generate()
  const originalURL = baseURL + inputURL.trim().split(' ').join('-') + '/'

  Url.findOne({longUrl: originalURL}, (err, foundURL) => {
    if (err){
      console.log(err)
    } else {
      if (foundURL == null){
        console.log('URL does not exist. Adding to database...')
        if (inputURL.length > 27){
          let shortenedURL = inputURL.substring(0, 18).trim().split(' ').join('-') + '/';
          let outputURL = baseURL + shortenedURL + shortCode + '/'
          Url.create({longUrl: originalURL, shortUrl: outputURL})
          res.render('show', {original: originalURL, short: outputURL})
        } else if (inputURL.length > 18 && inputURL.length <= 27) {
          let outputURL = baseURL + inputURL.split(' ').join('-') + '/'
          Url.create({longUrl: originalURL, shortUrl: outputURL})
          res.render('show', {original: originalURL, needlessShort1: true})
        } else {
          let outputURL = baseURL + inputURL.split(' ').join('-') + '/'
          Url.create({longUrl: originalURL, shortUrl: outputURL})
          res.render('show', {original: originalURL, needlessShort2: true})
        }
      } else {
        console.log('URL Exists: ' + foundURL.shortUrl)
        res.render('show', {exists: foundURL.shortUrl})
      }
    }
  })
})

app.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('Server running on port 3000. Happy coding!')
})