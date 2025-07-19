const { log } = require("console");
const express = require("express");
const _ = require("lodash")
// var fs = require('fs'); 
const router =  express.Router();
const { v4: uuid } = require("uuid");
// const MovieSchema = require('../../model/MovieSchema');
const fs = require('fs');

// MovieSchema.methods.saveToJSONFile = async function () {
//   try {
//     const moviesData = await fs.promises.readFile('movies.json', 'utf-8'); // Read existing data (if any)
//     const movies = JSON.parse(moviesData) || []; // Parse or create an empty array

//     movies.push(this); // Add the new movie to the array

//     await fs.promises.writeFile('movies.json', JSON.stringify(movies, null, 2)); // Write updated data
//     console.log('Movie saved to JSON file successfully!');
//   } catch (err) {
//     console.error('Error saving movie to JSON file:', err);
//   }
// };

// ... rest of your code

router.post('/', async (req, res) => {
  const newMovie = new MovieSchema(req.body);
  try {
    await newMovie.saveToJSONFile();
    res.status(200).json({ message: 'Movie saved successfully!' });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;