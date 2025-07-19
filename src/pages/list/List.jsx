import { useLocation, useHistory } from "react-router-dom";
import "./list.css";
import React, { useState, useEffect, useContext } from "react";
import { ListContext } from "../../context/listContext/ListContext";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { getMovies } from "../../context/movieContext/apiCalls";
import { updateList } from "../../context/listContext/apiCalls";
import { Link } from "react-router-dom/cjs/react-router-dom";

export default function List() {
  const location = useLocation();
  const history = useHistory();
  const { dispatch: listDispatch } = useContext(ListContext);
  const { movies, dispatch: movieDispatch } = useContext(MovieContext);

  const [list, setList] = useState(location.state?.list || {});
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);

  useEffect(() => {
    getMovies(movieDispatch);
    if (location.state?.list?.content) {
      setSelectedMovies(location.state.list.content);
    }
  }, [location.state, movieDispatch]);

  useEffect(() => {
    // Filter movies based on list type whenever list.type or movies change
    if (movies.length > 0) {
      const filtered = list.type
        ? movies.filter((movie) => movie.type === list.type)
        : movies;
      setFilteredMovies(filtered);
    }
  }, [list.type, movies]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;

    setList((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // If type changed, reset selected movies to only include those of the new type
    if (name === "type") {
      setSelectedMovies((prev) =>
        prev.filter((id) => {
          const movie = movies.find((m) => m._id === id);
          return movie?.type === newValue;
        })
      );
    }
  };

  const handleSelect = (e) => {
    const value = Array.from(
      e.target.selectedOptions,
      (option) => option.value
    );
    setSelectedMovies(value);
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
      const updatedList = {
        ...list,
        content: selectedMovies,
      };
      await updateList(list._id, updatedList, listDispatch);
      history.push("/lists");
    } catch (error) {
      console.error("Failed to update list:", error);
    }
  };

  if (!list._id) {
    return <div className="product">List not found</div>;
  }

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Edit List</h1>
        <Link to="/lists">
          <button className="productBackButton">Back to Lists</button>
        </Link>
      </div>

      <div className="productTop">
        <div className="productTopRight">
          <div className="productInfoTop">
            <span className="productName">
              {list.title}
              {list.isNetflixOriginal && (
                <span className="netflixOriginalBadge">Netflix Original</span>
              )}
            </span>
          </div>
          <div className="productInfoBottom">
            <div className="productInfoItem">
              <span className="productInfoKey">ID:</span>
              <span className="productInfoValue">{list._id}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">Type:</span>
              <span className="productInfoValue">
                {list.type || "Not specified"}
              </span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">Genre:</span>
              <span className="productInfoValue">{list.genre}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">Category:</span>
              <span className="productInfoValue">{list.category}</span>
            </div>
            <div className="productInfoItem">
              <span className="productInfoKey">Items:</span>
              <span className="productInfoValue">
                {selectedMovies.length} selected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="productBottom">
        <form className="productForm" onSubmit={handleSubmit}>
          <div className="productFormLeft">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={list.title || ""}
              onChange={handleChange}
              required
            />

            <label>Type</label>
            <select
              name="type"
              value={list.type || "movie"}
              onChange={handleChange}
              required
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="documentary">Documentary</option>
              <option value="standup">Standup Comedy</option>
              <option value="kids">Kids</option>
            </select>

            <label>Genre</label>
            <select
              name="genre"
              value={list.genre || "action"}
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
            </select>

            <label>Category</label>
            <select
              name="category"
              value={list.category || "trendingNow"}
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

            <label>Row Position</label>
            <input
              type="number"
              name="rowPosition"
              value={list.rowPosition || 0}
              onChange={handleNumberChange}
              min="0"
              required
            />

            <label>
              <input
                type="checkbox"
                name="isNetflixOriginal"
                checked={list.isNetflixOriginal || false}
                onChange={handleChange}
              />
              Netflix Original
            </label>

            <label>Match Score (0-100)</label>
            <input
              type="number"
              name="matchScore"
              value={list.matchScore || 0}
              onChange={handleNumberChange}
              min="0"
              max="100"
            />

            <label>Bullet Points (comma separated)</label>
            <input
              type="text"
              name="bullet"
              value={list.bullet?.join(", ") || ""}
              onChange={(e) => {
                setList((prev) => ({
                  ...prev,
                  bullet: e.target.value.split(",").map((item) => item.trim()),
                }));
              }}
            />
          </div>

          <div className="productFormRight" style={{ width: 800 }}>
            <div className="productUpload">
              <label>Content Items ({filteredMovies.length} available)</label>
              <select
                multiple
                name="content"
                value={selectedMovies}
                onChange={handleSelect}
                style={{ height: "300px", width: "500px" }}
              >
                {filteredMovies.map((movie) => (
                  <option key={movie._id} value={movie._id}>
                    {movie.title} ({movie.type})
                  </option>
                ))}
              </select>
            </div>

            <button className="productButton" type="submit">
              Update List
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
