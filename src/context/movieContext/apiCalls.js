import axios from "axios";
import {
  createMovieFailure,
  createMovieStart,
  createMovieSuccess,
  deleteMovieFailure,
  deleteMovieStart,
  deleteMovieSuccess,
  getMoviesFailure,
  getMoviesStart,
  getMoviesSuccess,
  updateMovieFailure,
  updateMovieStart,
  updateMovieSuccess,
} from "./MovieActions";

const API_BASE_URL = "https://whatsappbot-1-e6rt.onrender.com/api/movie";

export const getMovies = async (dispatch) => {
  dispatch(getMoviesStart());
  try {
    const res = await axios.get(`${API_BASE_URL}/get-all`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.data.success) {
      // Ensure no duplicates by creating a map with unique IDs
      const uniqueMovies = res.data.data.reduce((acc, movie) => {
        if (!acc[movie._id]) {
          acc[movie._id] = movie;
        }
        return acc;
      }, {});

      dispatch(getMoviesSuccess(Object.values(uniqueMovies)));
    } else {
      dispatch(getMoviesFailure());
    }
  } catch (err) {
    dispatch(getMoviesFailure());
    throw err;
  }
};

export const createMovie = async (movie, dispatch) => {
  dispatch(createMovieStart());
  try {
    // Format the movie data to match backend schema exactly
    const formattedMovie = {
      title: movie.title,
      desc: movie.desc,
      type: movie.type,
      isSeries: movie.type === "series",
      assets: {
        thumbnail: movie.assets.thumbnail,
        titleLogo: movie.assets.titleLogo || "",
        heroImage: movie.assets.heroImage || "",
        videoPreview: movie.assets.videoPreview || "",
        hoverPreview: movie.assets.hoverPreview || "", // Added missing field
      },
      genres: {
        primary: movie.genres.primary,
        secondary: movie.genres.secondary.filter((g) => g), // Remove empty strings
      },
      rating: movie.rating,
      year: Number(movie.year),
      limit: Number(movie?.limit),
      seriesInfo:
        movie.type === "series"
          ? {
              seasons: Number(movie.seriesInfo?.seasons),
              episodes: Number(movie.seriesInfo?.episodes),
              currentEpisode: {
                // Added default current episode
                title: movie.seriesInfo?.currentEpisode?.title || "",
                duration: movie.seriesInfo?.currentEpisode?.duration || "",
                description:
                  movie.seriesInfo?.currentEpisode?.description || "",
              },
            }
          : undefined,
      actions: {
        // Added required actions object
        playUrl: movie.actions?.playUrl || "",
        addToList: movie.actions?.addToList || false,
        isInMyList: false,
      },
      uiStates: {
        // Added uiStates with all required fields
        isFeatured: movie.uiStates.isFeatured,
        isTrending: movie.uiStates.isTrending,
        isNewRelease: movie.uiStates.isNewRelease,
        matchScore: movie.uiStates.matchScore,
      },
      technical: {
        // Added technical with all required fields
        aspectRatio: "16:9",
        resolution: "HD",
        audioLanguages: ["English"],
        subtitles: ["English"],
      },
    };

    // Remove undefined fields
    const payload = JSON.parse(JSON.stringify(formattedMovie));

    const res = await axios.post(API_BASE_URL, payload, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data.success) {
      dispatch(createMovieSuccess(res.data.data));
      alert(res.data.message);
      return res.data.data;
    } else {
      dispatch(createMovieFailure(res.data.message));
      alert(res.data.error);
      throw new Error(res.data.message);
    }
  } catch (err) {
    let errorMessage = "Failed to create movie";
    if (err.response) {
      errorMessage =
        err.response.data.message ||
        `Server responded with ${err.response.status}`;
      console.error("Error response:", err.response.data); // More detailed error
    }
    dispatch(createMovieFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

export const updateMovie = async (id, movie, dispatch) => {
  dispatch(updateMovieStart());
  try {
    const res = await axios.put(`${API_BASE_URL}/${id}`, movie, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });
    if (res.data.success == true) {
      dispatch(updateMovieSuccess(res.data.data));
      alert(res.data.message);
      return res.data.data; // Return the updated movie
    } else {
      dispatch(updateMovieFailure(res.data.message));
      alert(res.data.message);
      throw new Error(res.data.message);
    }
  } catch (err) {
    let errorMessage = "Failed to update movie";
    if (err.response) {
      errorMessage =
        err.response.data.message ||
        `Server responded with ${err.response.status}`;
    }
    dispatch(updateMovieFailure(errorMessage));
    throw new Error(errorMessage);
  }
};

export const deleteMovie = async (id, dispatch) => {
  dispatch(deleteMovieStart());
  try {
    const res = await axios.delete(`${API_BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (res.data.success) {
      dispatch(deleteMovieSuccess(id));
    } else {
      dispatch(deleteMovieFailure());
      throw new Error(res.data.message || "Failed to delete movie");
    }
  } catch (err) {
    dispatch(deleteMovieFailure());
    throw err;
  }
};
