import { Link, useLocation } from "react-router-dom";
import React, { useState, useContext } from "react";
import "./movie.css";
import { Publish } from "@material-ui/icons";
import { updateMovie } from "../../context/movieContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";

export default function Movie() {
  const location = useLocation();
  const movieData = location?.state?.movie || {};
  const { dispatch } = useContext(MovieContext);

  const [movie, setMovie] = useState({
    ...movieData,
    assets: movieData.assets || {
      thumbnail: "",
      titleLogo: "",
      heroImage: "",
      videoPreview: "",
      hoverPreview: "",
    },
    genres: movieData.genres || {
      primary: "",
      secondary: [],
    },
    uiStates: movieData.uiStates || {
      isFeatured: false,
      isTrending: false,
      isNewRelease: false,
      matchScore: 0,
    },
    technical: movieData.technical || {
      aspectRatio: "16:9",
      resolution: "HD",
      audioLanguages: [],
      subtitles: [],
    },
    actions: movieData.actions || {
      playUrl: "",
      addToList: false,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setMovie((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleNestedChange = (path, e) => {
    const { name, value, type, checked } = e.target;
    const keys = path.split(".");

    setMovie((prev) => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = type === "checkbox" ? checked : value;
      return newState;
    });
  };

  const handleArrayChange = (path, e) => {
    const { value } = e.target;
    const keys = path.split(".");

    setMovie((prev) => {
      const newState = { ...prev };
      let current = newState;

      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }

      current[keys[keys.length - 1]] = value
        .split(",")
        .map((item) => item.trim());
      return newState;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMovie(movie._id, movie, dispatch);
    } catch (error) {
      console.error("Failed to update movie:", error);
    }
  };

  const formatGenreName = (genre) => {
    if (!genre) return "";
    return genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  const formatGenres = () => {
    if (!movie.genres) return "";
    const primary = movie.genres.primary
      ? formatGenreName(movie.genres.primary)
      : "";
    const secondary = movie.genres.secondary
      ? movie.genres.secondary.map((genre) => formatGenreName(genre)).join(", ")
      : "";
    return [primary, secondary].filter(Boolean).join(", ");
  };

  return (
    <div className="product">
      <div className="productTitleContainer">
        <h1 className="productTitle">Movie Details</h1>
        <Link to="/newMovie">
          <button className="productAddButton">Create New</button>
        </Link>
      </div>

      <form className="addProductForm" onSubmit={handleSubmit}>
        <div className="productTop">
          <div className="productTopRight">
            <div className="productInfoTop">
              <img
                src={movie.assets?.thumbnail || ""}
                alt={movie.title}
                className="productInfoImg"
              />
              <span className="productName">{movie.title}</span>
            </div>
            <div className="productInfoBottom">
              <div className="productInfoItem">
                <span className="productInfoKey">ID:</span>
                <span className="productInfoValue">{movie._id}</span>
              </div>
              <div className="productInfoItem">
                <span className="productInfoKey">Type:</span>
                <span className="productInfoValue">
                  {movie.type} {movie.isSeries && "(Series)"}
                </span>
              </div>
              <div className="productInfoItem">
                <span className="productInfoKey">Genres:</span>
                <span className="productInfoValue">{formatGenres()}</span>
              </div>
              <div className="productInfoItem">
                <span className="productInfoKey">Year:</span>
                <span className="productInfoValue">{movie.year}</span>
              </div>
              <div className="productInfoItem">
                <span className="productInfoKey">Rating:</span>
                <span className="productInfoValue">{movie.rating}</span>
              </div>
              <div className="productInfoItem">
                <span className="productInfoKey">Age Limit:</span>
                <span className="productInfoValue">{movie.limit}+</span>
              </div>
              {movie.isSeries && (
                <>
                  <div className="productInfoItem">
                    <span className="productInfoKey">Seasons:</span>
                    <span className="productInfoValue">
                      {movie.seriesInfo?.seasons || 1}
                    </span>
                  </div>
                  <div className="productInfoItem">
                    <span className="productInfoKey">Episodes:</span>
                    <span className="productInfoValue">
                      {movie.seriesInfo?.episodes || 0}
                    </span>
                  </div>
                </>
              )}
              <div className="productInfoItem">
                <span className="productInfoKey">Status:</span>
                <span className="productInfoValue">
                  {[
                    movie.uiStates?.isFeatured && "Featured",
                    movie.uiStates?.isTrending && "Trending",
                    movie.uiStates?.isNewRelease && "New Release",
                  ]
                    .filter(Boolean)
                    .join(", ") || "Normal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="productBottom">
          <div className="productFormLeft">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={movie.title || ""}
              onChange={handleChange}
            />

            <label>Description</label>
            <textarea
              name="desc"
              value={movie.desc || ""}
              onChange={handleChange}
              rows={4}
            />

            <label>Type</label>
            <select
              name="type"
              value={movie.type || "movie"}
              onChange={handleChange}
            >
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="documentary">Documentary</option>
              <option value="standup">Standup Comedy</option>
              <option value="kids">Kids</option>
            </select>

            <label>Primary Genre</label>
            <select
              name="primary"
              value={movie.genres?.primary || ""}
              onChange={(e) => handleNestedChange("genres.primary", e)}
            >
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
            </select>

            <label>Secondary Genres (comma separated)</label>
            <input
              type="text"
              name="secondary"
              value={movie.genres?.secondary?.join(", ") || ""}
              onChange={(e) => handleArrayChange("genres.secondary", e)}
              placeholder="e.g. action, adventure"
            />

            <label>Year</label>
            <input
              type="number"
              name="year"
              value={movie.year || ""}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 5}
            />

            <label>Rating</label>
            <select
              name="rating"
              value={movie.rating || "PG-13"}
              onChange={handleChange}
            >
              <option value="G">G</option>
              <option value="PG">PG</option>
              <option value="PG-13">PG-13</option>
              <option value="R">R</option>
              <option value="NC-17">NC-17</option>
              <option value="TV-MA">TV-MA</option>
              <option value="TV-14">TV-14</option>
              <option value="TV-PG">TV-PG</option>
            </select>

            <label>Age Limit</label>
            <input
              type="number"
              name="limit"
              value={movie.limit || 0}
              onChange={handleChange}
              min="0"
              max="21"
            />

            <label>Play URL</label>
            <input
              type="text"
              name="playUrl"
              value={movie.actions?.playUrl || ""}
              onChange={(e) => handleNestedChange("actions.playUrl", e)}
              placeholder="Enter play URL"
            />

            <div className="checkboxGroup">
              <label>
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={movie.uiStates?.isFeatured || false}
                  onChange={(e) => handleNestedChange("uiStates.isFeatured", e)}
                />
                Featured Content
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={movie.uiStates?.isTrending || false}
                  onChange={(e) => handleNestedChange("uiStates.isTrending", e)}
                />
                Trending Content
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isNewRelease"
                  checked={movie.uiStates?.isNewRelease || false}
                  onChange={(e) =>
                    handleNestedChange("uiStates.isNewRelease", e)
                  }
                />
                New Release
              </label>
            </div>

            {movie.isSeries && (
              <>
                <label>Seasons</label>
                <input
                  type="number"
                  name="seasons"
                  value={movie.seriesInfo?.seasons || 1}
                  onChange={(e) => handleNestedChange("seriesInfo.seasons", e)}
                  min="1"
                />

                <label>Episodes</label>
                <input
                  type="number"
                  name="episodes"
                  value={movie.seriesInfo?.episodes || 1}
                  onChange={(e) => handleNestedChange("seriesInfo.episodes", e)}
                  min="1"
                />
              </>
            )}
          </div>

          <div className="productFormRight">
            <div className="assetUpload">
              <label>Thumbnail URL</label>
              <input
                type="text"
                name="thumbnail"
                value={movie.assets?.thumbnail || ""}
                onChange={(e) => handleNestedChange("assets.thumbnail", e)}
                placeholder="Enter thumbnail URL"
              />
              {movie.assets?.thumbnail && (
                <img
                  src={movie.assets.thumbnail}
                  alt="Thumbnail preview"
                  className="assetPreview"
                />
              )}
            </div>

            <div className="assetUpload">
              <label>Title Logo URL</label>
              <input
                type="text"
                name="titleLogo"
                value={movie.assets?.titleLogo || ""}
                onChange={(e) => handleNestedChange("assets.titleLogo", e)}
                placeholder="Enter title logo URL"
              />
              {movie.assets?.titleLogo && (
                <img
                  src={movie.assets.titleLogo}
                  alt="Title logo preview"
                  className="assetPreview"
                />
              )}
            </div>

            <div className="assetUpload">
              <label>Hero Image URL</label>
              <input
                type="text"
                name="heroImage"
                value={movie.assets?.heroImage || ""}
                onChange={(e) => handleNestedChange("assets.heroImage", e)}
                placeholder="Enter hero image URL"
              />
              {movie.assets?.heroImage && (
                <img
                  src={movie.assets.heroImage}
                  alt="Hero image preview"
                  className="assetPreview"
                />
              )}
            </div>

            <div className="assetUpload">
              <label>Hover Preview URL</label>
              <input
                type="text"
                name="hoverPreview"
                value={movie.assets?.hoverPreview || ""}
                onChange={(e) => handleNestedChange("assets.hoverPreview", e)}
                placeholder="Enter hover preview URL"
              />
              {movie.assets?.hoverPreview && (
                <img
                  src={movie.assets.hoverPreview}
                  alt="Hover preview"
                  className="assetPreview"
                />
              )}
            </div>

            <div className="assetUpload">
              <label>Video Preview URL</label>
              <input
                type="text"
                name="videoPreview"
                value={movie.assets?.videoPreview || ""}
                onChange={(e) => handleNestedChange("assets.videoPreview", e)}
                placeholder="Enter video preview URL"
              />
              {movie.assets?.videoPreview && (
                <video
                  src={movie.assets.videoPreview}
                  className="assetPreview"
                  controls
                  muted
                />
              )}
            </div>

            <div className="technicalSection">
              <h3>Technical Details</h3>
              <label>Aspect Ratio</label>
              <input
                type="text"
                name="aspectRatio"
                value={movie.technical?.aspectRatio || "16:9"}
                onChange={(e) => handleNestedChange("technical.aspectRatio", e)}
              />

              <label>Resolution</label>
              <select
                name="resolution"
                value={movie.technical?.resolution || "HD"}
                onChange={(e) => handleNestedChange("technical.resolution", e)}
              >
                <option value="SD">SD</option>
                <option value="HD">HD</option>
                <option value="4K">4K</option>
                <option value="HDR">HDR</option>
              </select>

              <label>Audio Languages (comma separated)</label>
              <input
                type="text"
                name="audioLanguages"
                value={movie.technical?.audioLanguages?.join(", ") || ""}
                onChange={(e) =>
                  handleArrayChange("technical.audioLanguages", e)
                }
                placeholder="e.g. English, Spanish"
              />

              <label>Subtitles (comma separated)</label>
              <input
                type="text"
                name="subtitles"
                value={movie.technical?.subtitles?.join(", ") || ""}
                onChange={(e) => handleArrayChange("technical.subtitles", e)}
                placeholder="e.g. English, Spanish"
              />
            </div>

            <button className="productButton" type="submit">
              Update
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
