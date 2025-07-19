import React, { useState, useContext } from "react";
import "./movieList.css";
import { DataGrid } from "@material-ui/data-grid";
import { DeleteOutline } from "@material-ui/icons";
import { Link } from "react-router-dom";
import { MovieContext } from "../../context/movieContext/MovieContext";
import { deleteMovie, getMovies } from "../../context/movieContext/apiCalls";

export default function MovieList() {
  const { movies, dispatch } = useContext(MovieContext);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMovies = async () => {
      try {
        await getMovies(dispatch);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching movies:", error);
        setLoading(false);
      }
    };

    fetchMovies();
  }, [dispatch]);

  const handleDelete = async (id) => {
    try {
      await deleteMovie(id, dispatch);
    } catch (error) {
      console.error("Error deleting movie:", error);
    }
  };

  const formatGenreName = (genre) => {
    if (!genre) return "";

    // Handle hyphenated genres (e.g., "sci-fi" -> "Sci-Fi")
    return genre
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("-");
  };

  const formatGenres = (genres) => {
    if (!genres) return "";

    const primary = genres.primary ? formatGenreName(genres.primary) : "";
    const secondary = genres.secondary
      ? genres.secondary.map((genre) => formatGenreName(genre)).join(", ")
      : "";

    return [primary, secondary].filter(Boolean).join(", ");
  };

  const columns = [
    { field: "_id", headerName: "ID", width: 90 },
    {
      field: "movie",
      headerName: "Movie",
      width: 200,
      renderCell: (params) => {
        return (
          <div className="productListItem">
            <img
              className="productListImg"
              src={params.row.assets?.thumbnail || ""}
              alt={params.row.title}
            />
            {params.row.title}
          </div>
        );
      },
    },
    {
      field: "genre",
      headerName: "Genre",
      width: 180,
      valueGetter: (params) => formatGenres(params.row.genres),
      renderCell: (params) => {
        return (
          <div className="productListItem">
            {formatGenres(params.row.genres)}
          </div>
        );
      },
    },
    { field: "year", headerName: "Year", width: 100 },
    { field: "limit", headerName: "Age Limit", width: 120 },
    {
      field: "isSeries",
      headerName: "Type",
      width: 120,
      valueGetter: (params) => (params.row.isSeries ? "Series" : "Movie"),
    },
    {
      field: "action",
      headerName: "Action",
      width: 150,
      renderCell: (params) => {
        return (
          <>
            <Link
              to={{
                pathname: `/movie/${params.row._id}`,
                state: { movie: params.row },
              }}
              state={{ movie: params.row }}
            >
              <button className="productListEdit">Edit</button>
            </Link>
            <DeleteOutline
              className="productListDelete"
              onClick={() => handleDelete(params.row._id)}
            />
          </>
        );
      },
    },
  ];

  return (
    <div className="productList">
      <div className="productTitleContainer">
        <h1 className="productTitle">{movies.isSeries ? "Series" : "Movie"}</h1>
        <Link to="/newMovie">
          <button className="productAddButton">Create</button>
        </Link>
      </div>
      <DataGrid
        rows={movies}
        disableSelectionOnClick
        columns={columns}
        pageSize={8}
        checkboxSelection
        getRowId={(r) => r._id}
        autoHeight
      />
    </div>
  );
}
