const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let movieDb = null;

const initializeDbAndServer = async () => {
  try {
    movieDb = await open({
      filename: path.join(__dirname, "./moviesData.db"),
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

initializeDbAndServer();

module.exports = app;

// get movies
app.get("/movies/", async (request, response) => {
  try {
    const getMoviesQuery = `
        SELECT
        *
        FROM 
        movie;`;
    const DbResponse = await movieDb.all(getMoviesQuery);
    // response.send(
    //   DbResponse.map((eachMovie) => ({
    //     movieName: eachMovie.movie_name,
    //   }))
    // );
    response.send(DbResponse);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// post movie
app.post("/movies/", async (request, response) => {
  try {
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const addMovieQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES 
    (
        '${directorId}',
        '${movieName}',
        '${leadActor}'
    );`;
    const dbResponse = await movieDb.run(addMovieQuery);
    response.send("Movie Successfully Added");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

const convertMovieDbObjectToResponseObject = (movieDbObject) => {
  return {
    movieId: movieDbObject.movie_id,
    directorId: movieDbObject.director_id,
    movieName: movieDbObject.movie_name,
    leadActor: movieDbObject.lead_actor,
  };
};

// get movie
app.get("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const getMovieQuery = `
        SELECT
        *
        FROM 
        movie
        WHERE
        movie_id = '${movieId}';`;
    const movieDetails = await movieDb.get(getMovieQuery);
    response.send(convertMovieDbObjectToResponseObject(movieDetails));
    // response.send(movieDetails);
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// update movie details
app.put("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const movieDetails = request.body;
    const { directorId, movieName, leadActor } = movieDetails;
    const updateMovieDetailsQuery = `
    UPDATE
    movie
    SET 
        director_id = '${directorId}',
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
    movie_id = '${movieId}';`;
    const dbResponse = await movieDb.run(updateMovieDetailsQuery);
    response.send("Movie Details Updated");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// delete movie
app.delete("/movies/:movieId/", async (request, response) => {
  try {
    const { movieId } = request.params;
    const deleteMovieQuery = `
    DELETE FROM
    movie
    WHERE
    movie_id = '${movieId}';`;
    const dbResponse = await movieDb.run(deleteMovieQuery);
    response.send("Movie Removed");
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

const convertDirectorObjectToResponseObject = (directorObject) => {
  return {
    directorId: directorObject.director_id,
    directorName: directorObject.director_name,
  };
};

// get directors
app.get("/directors/", async (request, response) => {
  try {
    const getDirectorsQuery = `
        SELECT
        *
        FROM 
        director;`;
    const directorsArray = await movieDb.all(getDirectorsQuery);
    response.send(directorsArray.map(convertDirectorObjectToResponseObject));
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});

// get director movies
app.get("/directors/:directorId/movies/", async (request, response) => {
  try {
    const { directorId } = request.params;
    const getDirectorMoviesQuery = `
        SELECT
        movie_name
        FROM 
        movie
        WHERE
        director_id = '${directorId}';`;
    const directorMoviesArray = await movieDb.all(getDirectorMoviesQuery);
    response.send(
      directorMoviesArray.map((eachMovie) => ({
        movieName: eachMovie.movie_name,
      }))
    );
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
});
