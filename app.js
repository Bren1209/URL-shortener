const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const shortId = require('shortid');

require('dotenv').config()

const app = express();
const baseURL = 'https://cimso.xyz/'

app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.set('views', __dirname + '/views');

mongoose.connect('mongodb+srv://username:password@cluster0.cz9bm.mongodb.net/url-shortener-cimso?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

const shorteningSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String,
  uniqueCode: String
})

const Url = new mongoose.model('Url', shorteningSchema)

app.get('/', (req, res) => {
  const currentYear = new Date().getFullYear()
  res.render('index', {currentYear: currentYear})
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

app.get('/crosscheck', (req, res) => {
  res.render('crosscheck');
})

app.post('/shortened-url', (req, res) => {
  const inputURL = req.body.ogurl.trim().toLowerCase();
  const originalURL = baseURL + inputURL.trim().split(' ').join('-') + '/'
  const shortCode = shortId.generate()

  Url.findOne({uniqueCode: shortCode}, (err, foundCode) => {
    if (err){
      console.log(err)
    } else {
      if (foundCode == null){
        console.log('Generated short code does not exist in database. Proceeding.')
      } else {
        while (foundCode.uniqueCode === shortCode){
          console.log('Generated short code already exists in DB. Chance of this happening is: 0.0000000000000074 %. Unreal. Regenerating code...')
          shortCode = shortId.generate()
        }
      }
    }
  })

  Url.findOne({longUrl: originalURL}, (err, foundURL) => {
    if (err){
      console.log(err)
    } else {
      if (foundURL == null){
        console.log('URL does not exist. Adding to database...')
        let outputURL = baseURL + shortCode + '/'
        Url.create({longUrl: originalURL, shortUrl: outputURL, uniqueCode: shortCode})
        res.render('show', {original: originalURL, short: outputURL})
      } else {
        console.log('URL Exists: ' + foundURL.shortUrl)
        res.render('show', {exists: foundURL.shortUrl})
      }
    }
  })
})

app.post('/find-short', (req, res) => {
  const long = req.body.long
  Url.findOne({longUrl: long}, (err, foundURL) => {
    if(err){
      console.log(err)
      let errMsg = 'There was a problem finding the URL. Please check for any typos. Error code: \n' + err
      res.render('show', {errMsg: errMsg})
    } else {
      if (foundURL !== null){
        res.render('show', {foundURL: foundURL.shortUrl})
      } else {
        let errMsg = 'There was a problem finding the URL. Please check for any typos. Error code: \n' + err
        res.render('show', {errMsg: errMsg})
      }
    }
  })
})

app.post('/find-long', (req, res) => {
  const short = req.body.short
  Url.findOne({shortUrl: short}, (err, foundURL) => {
    if(err){
      console.log(err)
      let errMsg = 'There was a problem finding the URL. Please check for any typos. Error code: \n' + err
      res.render('show', {errMsg: errMsg})
    } else {
      if (foundURL !== null){
        res.render('show', {foundURL: foundURL.longUrl})
      } else {
        let errMsg = 'There was a problem finding the URL. Please check for any typos. Error code: \n' + err
        res.render('show', {errMsg: errMsg})
      }
    }
  })
})

app.listen(process.env.PORT || 3000, process.env.IP, () => {
  console.log('Server running on port 3000. Happy coding!')
})