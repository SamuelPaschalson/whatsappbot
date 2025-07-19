import React, { useContext, useEffect, useState } from "react";
import "./newList.css";
import { getMovies } from "../../context/movieContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { ListContext } from "../../context/listContext/ListContext";
import { createList } from "../../context/listContext/apiCalls";
import { useHistory } from "react-router-dom";

export default function NewList() {
  const [list, setList] = useState({
    title: "",
    type: "movie",
    genre: "action",
    content: [],
    category: "trendingNow",
    rowPosition: 0,
    isNetflixOriginal: false,
    matchScore: 0,
    bullet: [],
  });

  const history = useHistory();
  const { dispatch } = useContext(ListContext);
  const { movies, dispatch: dispatchMovie } = useContext(MovieContext);

  useEffect(() => {
    getMovies(dispatchMovie);
  }, [dispatchMovie]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setList((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelect = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setList((prev) => ({ ...prev, content: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setList((prev) => ({
      ...prev,
      [name]: value === "" ? "" : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createList(list, dispatch);
      history.push("/lists");
    } catch (error) {
      console.error("Failed to create list:", error);
    }
  };

  // Filter movies based on selected type and genre
  const filteredMovies = movies.filter((movie) => {
    // If type is mixed, show all content types
    const typeMatches = list.type === "mixed" || movie.type === list.type;

    // Check if movie has the selected genre in its primary or secondary genres
    const genreMatches =
      movie.genres?.primary === list.genre ||
      movie.genres?.secondary?.includes(list.genre);

    return typeMatches && genreMatches;
  });

  return (
    <div className="newProduct">
      <h1 className="addProductTitle">New List</h1>
      <form className="addProductForm" onSubmit={handleSubmit}>
        <div className="formLeft">
          <div className="addProductItem">
            <label>Title*</label>
            <input
              type="text"
              placeholder="Popular Movies"
              name="title"
              value={list.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addProductItem">
            <label>Type*</label>
            <select
              name="type"
              value={list.type}
              onChange={handleChange}
              required
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="mixed">Mixed (Movies & Series)</option>
              <option value="documentary">Documentary</option>
              <option value="standup">Standup Comedy</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Genre*</label>
            <select
              name="genre"
              value={list.genre}
              onChange={handleChange}
              required
            >
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="horror">Horror</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="thriller">Thriller</option>
              <option value="romance">Romance</option>
              <option value="documentary">Documentary</option>
              <option value="animation">Animation</option>
              <option value="crime">Crime</option>
              <option value="fantasy">Fantasy</option>
              <option value="sports">Sports</option>
              <option value="mystery">Mystery</option>
              <option value="war">War</option>
              <option value="western">Western</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Category*</label>
            <select
              name="category"
              value={list.category}
              onChange={handleChange}
              required
            >
              <option value="trendingNow">Trending Now</option>
              <option value="popularOnNetflix">Popular on Netflix</option>
              <option value="continueWatching">Continue Watching</option>
              <option value="newReleases">New Releases</option>
              <option value="watchAgain">Watch Again</option>
              <option value="awardWinning">Award Winning</option>
              <option value="becauseYouWatched">Because You Watched</option>
              <option value="myList">My List</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Row Position*</label>
            <input
              type="number"
              placeholder="0"
              name="rowPosition"
              value={list.rowPosition}
              onChange={handleNumberChange}
              min="0"
              required
            />
          </div>

          <div className="addProductItem">
            <label>
              <input
                type="checkbox"
                name="isNetflixOriginal"
                checked={list.isNetflixOriginal}
                onChange={handleChange}
              />
              Netflix Original
            </label>
          </div>

          <div className="addProductItem">
            <label>Match Score (0-100)</label>
            <input
              type="number"
              placeholder="0"
              name="matchScore"
              value={list.matchScore}
              onChange={handleNumberChange}
              min="0"
              max="100"
            />
          </div>
        </div>

        <div className="formRight" style={{ right: 0, width: 800 }}>
          <div className="addProductItem">
            <label>Content*</label>
            <select
              multiple
              name="content"
              value={list.content}
              onChange={handleSelect}
              style={{ height: "280px" }}
              required
            >
              {filteredMovies.map((movie) => (
                <option key={movie._id} value={movie._id}>
                  {movie.title} ({movie.type})
                </option>
              ))}
            </select>
          </div>

          <div className="addProductItem">
            <label>Bullet Points (comma separated)</label>
            <input
              type="text"
              placeholder="Trending, New Releases, etc."
              name="bullet"
              value={list.bullet.join(", ")}
              onChange={(e) => {
                setList((prev) => ({
                  ...prev,
                  bullet: e.target.value.split(",").map((item) => item.trim()),
                }));
              }}
            />
          </div>
        </div>

        <button className="addProductButton" type="submit">
          Create
        </button>
      </form>
    </div>
  );
}
