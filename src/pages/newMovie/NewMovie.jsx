import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import "./newMovie.css";
import { createMovie } from "../../context/movieContext/apiCalls";
import { MovieContext } from "../../context/movieContext/MovieContext";

export default function NewMovie() {
  const [movie, setMovie] = useState({
    title: "",
    desc: "",
    year: new Date().getFullYear(),
    limit: 16,
    type: "movie",
    rating: "PG-13",
    genres: {
      primary: "action",
      secondary: [],
    },
    assets: {
      thumbnail: "",
      titleLogo: "",
      heroImage: "",
      hoverPreview: "",
      videoPreview: "",
    },
    seriesInfo: {
      seasons: 1,
      episodes: 1,
    },
    uiStates: {
      isFeatured: false,
      isTrending: false,
      isNewRelease: false,
      matchScore: 80,
    },
    actions: {
      playUrl: "",
      addToList: false,
    },
    technical: {
      aspectRatio: "16:9",
      resolution: "HD",
      audioLanguages: ["English"],
      subtitles: ["English"],
    },
  });
  const [loading, setLoading] = useState(true);
  const [importedIds, setImportedIds] = useState([]);
  const { dispatch } = useContext(MovieContext);

  // Fetch random content based on type when component mounts
  useEffect(() => {
    fetchRandomContent(movie.type);
  }, []);

  const fetchRandomContent = async (contentType) => {
    try {
      setLoading(true);

      // First get popular content to ensure quality
      const endpoint = contentType === "movie" ? "movie" : "tv";
      const popularResponse = await axios.get(
        `https://api.themoviedb.org/3/${endpoint}/popular?api_key=14b060019eea7677933c8560e75ad24f`
      );

      // Filter out content we've already imported
      const availableContent = popularResponse.data.results.filter(
        (item) => !importedIds.includes(item.id)
      );

      if (availableContent.length === 0) {
        throw new Error(`No new ${contentType}s available to import`);
      }

      // Pick random content from available ones
      const randomContent =
        availableContent[Math.floor(Math.random() * availableContent.length)];

      // Get full details
      const detailsResponse = await axios.get(
        `https://api.themoviedb.org/3/${endpoint}/${
          randomContent.id
        }?api_key=14b060019eea7677933c8560e75ad24f&append_to_response=videos,images${
          contentType === "tv" ? ",content_ratings" : ",release_dates"
        }`
      );

      // Transform data based on content type
      const newContentData =
        contentType === "movie"
          ? transformMovieData(detailsResponse.data)
          : transformSeriesData(detailsResponse.data);

      setMovie(newContentData);
      setImportedIds((prev) => [...prev, randomContent.id]);
    } catch (error) {
      console.error(`Error fetching random ${contentType}:`, error);
      alert(`Failed to fetch ${contentType}. Using default form.`);
    } finally {
      setLoading(false);
    }
  };

  const transformMovieData = (tmdbData) => {
    const videos = tmdbData.videos?.results || [];
    const trailer = videos.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    const images = tmdbData.images || {};
    const logo = images.logos?.[0] || {};
    return {
      title: tmdbData.title,
      desc: tmdbData.overview,
      year: tmdbData.release_date
        ? new Date(tmdbData.release_date).getFullYear()
        : new Date().getFullYear(),
      limit: tmdbData.adult ? 18 : 16,
      type: "movie",
      rating: getContentRating(tmdbData),
      genres: {
        primary: tmdbData.genres?.[0]?.name.toLowerCase() || "action",
        secondary:
          tmdbData.genres?.slice(1, 3).map((g) => g.name.toLowerCase()) || [],
      },
      assets: {
        thumbnail: tmdbData.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
          : "",
        titleLogo: logo.file_path
          ? `https://image.tmdb.org/t/p/original${logo.file_path}`
          : "",
        heroImage: tmdbData.backdrop_path
          ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
          : "",
        hoverPreview: tmdbData.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path}`
          : "",
        videoPreview: trailer
          ? `https://www.youtube.com/watch?v=${trailer.key}`
          : "",
      },
      seriesInfo: {
        seasons: 1,
        episodes: 1,
      },
      uiStates: {
        isFeatured: false,
        isTrending: tmdbData.popularity > 50 ? true : false,
        isNewRelease: isNewRelease(tmdbData.release_date) ? true : false,
        matchScore: Math.min(
          Math.floor((tmdbData.vote_average || 5) * 10),
          100
        ),
      },
      actions: {
        playUrl: trailer
          ? `https://www.youtube.com/watch?v=${trailer.key}`
          : "",
        addToList: false,
      },
      technical: {
        aspectRatio: "16:9",
        resolution: "HD",
        audioLanguages: ["English"],
        subtitles: ["English"],
      },
    };
  };

  const transformSeriesData = (tmdbData) => {
    const videos = tmdbData.videos?.results || [];

    const trailer = videos.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    const images = tmdbData.images || {};
    const logo = images.logos?.[0] || {};

    return {
      title: tmdbData.name,
      desc: tmdbData.overview,
      year: tmdbData.first_air_date
        ? new Date(tmdbData.first_air_date).getFullYear()
        : new Date().getFullYear(),
      limit: tmdbData.adult ? 18 : 16,
      type: "series",
      rating: getContentRating(tmdbData),
      genres: {
        primary: tmdbData.genres?.[0]?.name.toLowerCase() || "drama",
        secondary:
          tmdbData.genres?.slice(1, 3).map((g) => g.name.toLowerCase()) || [],
      },
      assets: {
        thumbnail: tmdbData.poster_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.poster_path}`
          : "",
        titleLogo: logo.file_path
          ? `https://image.tmdb.org/t/p/original${logo.file_path}`
          : "",
        heroImage: tmdbData.backdrop_path
          ? `https://image.tmdb.org/t/p/original${tmdbData.backdrop_path}`
          : "",
        hoverPreview: tmdbData.backdrop_path
          ? `https://image.tmdb.org/t/p/w500${tmdbData.backdrop_path}`
          : "",
        videoPreview: trailer
          ? `https://www.youtube.com/watch?v=${trailer.key}`
          : "",
      },
      seriesInfo: {
        seasons: tmdbData.number_of_seasons || 1,
        episodes: tmdbData.number_of_episodes || 1,
        currentEpisode: {
          title: tmdbData.last_episode_to_air?.name || "Unknown",
          duration: `${tmdbData.episode_run_time?.[0] || 45}m`,
          description: tmdbData.last_episode_to_air?.overview || "",
        },
      },
      uiStates: {
        isFeatured: false,
        isTrending: tmdbData.popularity > 50 ? true : false,
        isNewRelease: isNewRelease(tmdbData.release_date) ? true : false,
        matchScore: Math.min(
          Math.floor((tmdbData.vote_average || 5) * 10),
          100
        ),
      },
      actions: {
        playUrl: trailer
          ? `https://www.youtube.com/watch?v=${trailer.key}`
          : "",
        addToList: false,
      },
      technical: {
        aspectRatio: "16:9",
        resolution: "HD",
        audioLanguages: ["English"],
        subtitles: ["English"],
      },
    };
  };

  const getContentRating = (tmdbData) => {
    // For movies
    if (tmdbData.release_dates?.results) {
      const usRelease = tmdbData.release_dates.results.find(
        (r) => r.iso_3166_1 === "US"
      );
      const rating = usRelease?.release_dates?.[0]?.certification;
      if (rating && ["G", "PG", "PG-13", "R", "NC-17"].includes(rating)) {
        return rating;
      }
    }

    // For TV shows
    if (tmdbData.content_ratings?.results) {
      const usRating = tmdbData.content_ratings.results.find(
        (r) => r.iso_3166_1 === "US"
      );
      if (usRating?.rating) {
        return normalizeTVRating(usRating.rating);
      }
    }

    return "PG-13"; // Default
  };

  const normalizeTVRating = (rating) => {
    const tvMap = {
      "TV-Y": "G",
      "TV-Y7": "PG",
      "TV-G": "G",
      "TV-PG": "PG",
      "TV-14": "PG-13",
      "TV-MA": "R",
    };
    return tvMap[rating] || "PG-13";
  };

  const isNewRelease = (releaseDate) => {
    if (!releaseDate) return false;
    const release = new Date(releaseDate);
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return release > threeMonthsAgo;
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();

    createMovie(movie, dispatch);
  };

  const fetchNewRandomContent = async (contentType) => {
    setLoading(true);
    try {
      await fetchRandomContent(contentType);
    } catch (error) {
      console.error(`Error fetching new ${contentType}:`, error);
      alert(`Failed to fetch ${contentType}. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="newProduct">
        <h1 className="addProductTitle">Loading Content Data...</h1>
        <div className="loadingSpinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="newProduct">
      <div className="headerRow">
        <h1 className="addProductTitle">
          New {movie.type.charAt(0).toUpperCase() + movie.type.slice(1)}
        </h1>
        <div className="fetchButtons">
          <button
            type="button"
            className="fetchNewButton"
            onClick={() => fetchNewRandomContent("movie")}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Random Popular Movie"}
          </button>
          {/* <button
            type="button"
            className="fetchNewButton"
            onClick={() => fetchNewRandomContent("movie")}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Random Is Trending Movie"}
          </button> */}
          <button
            type="button"
            className="fetchNewButton"
            onClick={() => fetchNewRandomContent("series")}
            disabled={loading}
          >
            {loading ? "Loading..." : "Get Random Series"}
          </button>
        </div>
      </div>
      <form className="addProductForm" onSubmit={handleSubmit}>
        <div className="formSection">
          <h3>Basic Information</h3>
          <div className="addProductItem">
            <label>Title</label>
            <input
              type="text"
              placeholder="Movie Title"
              name="title"
              value={movie.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="addProductItem">
            <label>Description</label>
            <textarea
              placeholder="Movie description"
              name="desc"
              value={movie.desc}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>

          <div className="addProductItem">
            <label>Type</label>
            <select name="type" value={movie.type} onChange={handleChange}>
              <option value="movie">Movie</option>
              <option value="series">Series</option>
              <option value="documentary">Documentary</option>
              <option value="standup">Standup Comedy</option>
              <option value="kids">Kids</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Primary Genre</label>
            <select
              name="primary"
              value={movie.genres.primary}
              onChange={(e) => handleNestedChange("genres.primary", e)}
              required
            >
              <option value="action">Action</option>
              <option value="comedy">Comedy</option>
              <option value="drama">Drama</option>
              <option value="sci-fi">Sci-Fi</option>
              <option value="horror">Horror</option>
              <option value="romance">Romance</option>
              <option value="thriller">Thriller</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Secondary Genres (comma separated)</label>
            <input
              type="text"
              placeholder="e.g. action, adventure"
              name="secondary"
              value={movie.genres.secondary.join(", ")}
              onChange={(e) => handleArrayChange("genres.secondary", e)}
            />
          </div>

          <div className="addProductItem">
            <label>Year</label>
            <input
              type="number"
              placeholder={new Date().getFullYear()}
              name="year"
              value={movie.year}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear() + 5}
              required
            />
          </div>

          <div className="addProductItem">
            <label>Rating</label>
            <select
              name="rating"
              value={movie.rating}
              onChange={handleChange}
              required
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
          </div>

          <div className="addProductItem">
            <label>Age Limit</label>
            <input
              type="number"
              placeholder="16"
              name="limit"
              value={movie.limit}
              onChange={handleChange}
              min="0"
              max="21"
              required
            />
          </div>

          <div className="addProductItem">
            <label>Match Score</label>
            <input
              type="number"
              placeholder="80"
              name="matchScore"
              value={movie.uiStates.matchScore}
              onChange={(e) => handleNestedChange("uiStates.matchScore", e)}
              min="0"
              max="100"
            />
          </div>

          <div className="addProductItem">
            <label>Play URL</label>
            <input
              type="text"
              placeholder="Enter play URL"
              name="playUrl"
              value={movie.actions.playUrl}
              onChange={(e) => handleNestedChange("actions.playUrl", e)}
              required
            />
          </div>
        </div>

        <div className="formSection">
          <h3>UI States</h3>
          <div className="checkboxGroup">
            <label>
              <input
                type="checkbox"
                name="isFeatured"
                checked={movie.uiStates.isFeatured}
                onChange={(e) => handleNestedChange("uiStates.isFeatured", e)}
              />
              Featured Content
            </label>
            <label>
              <input
                type="checkbox"
                name="isTrending"
                checked={movie.uiStates.isTrending}
                onChange={(e) => handleNestedChange("uiStates.isTrending", e)}
              />
              Trending Content
            </label>
            <label>
              <input
                type="checkbox"
                name="isNewRelease"
                checked={movie.uiStates.isNewRelease}
                onChange={(e) => handleNestedChange("uiStates.isNewRelease", e)}
              />
              New Release
            </label>
          </div>
        </div>

        {movie.type === "series" && (
          <div className="formSection">
            <h3>Series Information</h3>
            <div className="addProductItem">
              <label>Number of Seasons</label>
              <input
                type="number"
                placeholder="1"
                name="seasons"
                value={movie.seriesInfo.seasons}
                onChange={(e) => handleNestedChange("seriesInfo.seasons", e)}
                min="1"
                required
              />
            </div>
            <div className="addProductItem">
              <label>Number of Episodes</label>
              <input
                type="number"
                placeholder="10"
                name="episodes"
                value={movie.seriesInfo.episodes}
                onChange={(e) => handleNestedChange("seriesInfo.episodes", e)}
                min="1"
                required
              />
            </div>
          </div>
        )}

        <div className="formSection">
          <h3>Assets</h3>
          <div className="assetGrid">
            <div className="addProductItem">
              <label>Thumbnail URL</label>
              <input
                type="text"
                placeholder="https://example.com/thumbnail.jpg"
                name="thumbnail"
                value={movie.assets.thumbnail}
                onChange={(e) => handleNestedChange("assets.thumbnail", e)}
                required
              />
              {movie.assets.thumbnail && (
                <img
                  src={movie.assets.thumbnail}
                  alt="Thumbnail preview"
                  className="imagePreview"
                />
              )}
            </div>

            <div className="addProductItem">
              <label>Title Logo URL</label>
              <input
                type="text"
                placeholder="https://example.com/logo.png"
                name="titleLogo"
                value={movie.assets.titleLogo}
                onChange={(e) => handleNestedChange("assets.titleLogo", e)}
              />
              {movie.assets.titleLogo && (
                <img
                  src={movie.assets.titleLogo}
                  alt="Title logo preview"
                  className="imagePreview"
                />
              )}
            </div>

            <div className="addProductItem">
              <label>Hero Image URL</label>
              <input
                type="text"
                placeholder="https://example.com/hero.jpg"
                name="heroImage"
                value={movie.assets.heroImage}
                onChange={(e) => handleNestedChange("assets.heroImage", e)}
              />
              {movie.assets.heroImage && (
                <img
                  src={movie.assets.heroImage}
                  alt="Hero image preview"
                  className="imagePreview"
                />
              )}
            </div>

            <div className="addProductItem">
              <label>Hover Preview URL</label>
              <input
                type="text"
                placeholder="https://example.com/hover.jpg"
                name="hoverPreview"
                value={movie.assets.hoverPreview}
                onChange={(e) => handleNestedChange("assets.hoverPreview", e)}
              />
              {movie.assets.hoverPreview && (
                <img
                  src={movie.assets.hoverPreview}
                  alt="Hover preview"
                  className="imagePreview"
                />
              )}
            </div>

            <div className="addProductItem">
              <label>Video Preview URL</label>
              <input
                type="text"
                placeholder="https://example.com/preview.mp4"
                name="videoPreview"
                value={movie.assets.videoPreview}
                onChange={(e) => handleNestedChange("assets.videoPreview", e)}
              />
              {movie.assets.videoPreview && (
                <video
                  src={movie.assets.videoPreview}
                  className="videoPreview"
                  controls
                  muted
                />
              )}
            </div>
          </div>
        </div>

        <div className="formSection">
          <h3>Technical Details</h3>
          <div className="addProductItem">
            <label>Aspect Ratio</label>
            <input
              type="text"
              name="aspectRatio"
              value={movie.technical.aspectRatio}
              onChange={(e) => handleNestedChange("technical.aspectRatio", e)}
            />
          </div>

          <div className="addProductItem">
            <label>Resolution</label>
            <select
              name="resolution"
              value={movie.technical.resolution}
              onChange={(e) => handleNestedChange("technical.resolution", e)}
            >
              <option value="SD">SD</option>
              <option value="HD">HD</option>
              <option value="4K">4K</option>
              <option value="HDR">HDR</option>
            </select>
          </div>

          <div className="addProductItem">
            <label>Audio Languages (comma separated)</label>
            <input
              type="text"
              name="audioLanguages"
              value={movie.technical.audioLanguages.join(", ")}
              onChange={(e) => handleArrayChange("technical.audioLanguages", e)}
              placeholder="e.g. English, Spanish"
            />
          </div>

          <div className="addProductItem">
            <label>Subtitles (comma separated)</label>
            <input
              type="text"
              name="subtitles"
              value={movie.technical.subtitles.join(", ")}
              onChange={(e) => handleArrayChange("technical.subtitles", e)}
              placeholder="e.g. English, Spanish"
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
